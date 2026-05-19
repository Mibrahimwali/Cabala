use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer as SplTransfer};
use mpl_token_metadata::accounts::Metadata;
use std::str::FromStr;

declare_id!("EazAH8Adyino7uConjZfYdjFqmjqfm7vBtTsba3Ejg39");

pub const LTV_AMOUNT: u64 = 1_200_000_000; // 1.2 SOL
pub const LOAN_DURATION: i64 = 7 * 24 * 60 * 60; // 7 days in seconds
pub const KEEPER_BOUNTY: u64 = 20_000_000; // 0.02 SOL
// TODO: Replace with the actual Metaplex Collection Mint Pubkey for Jito Cabal
pub const CABAL_COLLECTION: &str = "5YVNYsdh7RPEunc5VaiX4ky33W6TjTq9Vwt34Bhpfjtw"; 

#[program]
pub mod jito_cabal_lending {
    use super::*;

    pub fn initialize_pool(ctx: Context<InitializePool>) -> Result<()> {
        let pool = &mut ctx.accounts.global_pool;
        pool.admin = ctx.accounts.admin.key();
        pool.total_sol = 0;
        pool.total_shares = 0;
        pool.bump = ctx.bumps.global_pool;
        msg!("Jito Cabal Lending Pool Initialized. Admin: {}", pool.admin);
        Ok(())
    }

    pub fn deposit_liquidity(ctx: Context<DepositLiquidity>, amount: u64) -> Result<()> {
        let pool = &mut ctx.accounts.global_pool;
        
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.lender.to_account_info(),
                to: pool.to_account_info(),
            },
        );
        transfer(cpi_context, amount)?;

        let shares = if pool.total_sol == 0 {
            amount
        } else {
            (amount as u128)
                .checked_mul(pool.total_shares as u128)
                .ok_or(ErrorCode::MathOverflow)?
                .checked_div(pool.total_sol as u128)
                .ok_or(ErrorCode::MathOverflow)? as u64
        };

        pool.total_sol = pool.total_sol.checked_add(amount).ok_or(ErrorCode::MathOverflow)?;
        pool.total_shares = pool.total_shares.checked_add(shares).ok_or(ErrorCode::MathOverflow)?;

        msg!("Deposited {} SOL. Issued {} Shares.", amount, shares);
        Ok(())
    }

    pub fn borrow(ctx: Context<Borrow>) -> Result<()> {
        let pool = &mut ctx.accounts.global_pool;
        let receipt = &mut ctx.accounts.loan_receipt;
        let clock = Clock::get()?;

        // 1. Strict Metaplex Certified Collection (MCC) Verification
        let metadata_info = &ctx.accounts.nft_metadata;
        let metadata = Metadata::try_from(&metadata_info.to_account_info()).map_err(|_| ErrorCode::InvalidMetadata)?;
        
        let collection = metadata.collection.ok_or(ErrorCode::NotPartOfCollection)?;
        require!(collection.verified, ErrorCode::CollectionNotVerified);
        
        let expected_collection_pubkey = Pubkey::from_str(CABAL_COLLECTION).unwrap();
        require!(collection.key == expected_collection_pubkey, ErrorCode::InvalidCollection);

        // 2. Rent-Exemption Safety Check
        let rent_minimum = Rent::get()?.minimum_balance(pool.to_account_info().data_len());
        require!(pool.total_sol >= LTV_AMOUNT, ErrorCode::InsufficientLiquidity);
        
        let current_lamports = pool.to_account_info().lamports();
        require!(current_lamports.checked_sub(LTV_AMOUNT).ok_or(ErrorCode::MathOverflow)? >= rent_minimum, ErrorCode::RentExemptionRisk);

        // 3. Transfer NFT to Escrow
        let cpi_accounts = SplTransfer {
            from: ctx.accounts.borrower_nft_account.to_account_info(),
            to: ctx.accounts.escrow_nft_account.to_account_info(),
            authority: ctx.accounts.borrower.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::transfer(CpiContext::new(cpi_program, cpi_accounts), 1)?;

        // 4. Dispense SOL
        pool.total_sol = pool.total_sol.checked_sub(LTV_AMOUNT).ok_or(ErrorCode::MathOverflow)?;
        **pool.to_account_info().try_borrow_mut_lamports()? -= LTV_AMOUNT;
        **ctx.accounts.borrower.try_borrow_mut_lamports()? += LTV_AMOUNT;

        // 5. Initialize Receipt
        receipt.borrower = ctx.accounts.borrower.key();
        receipt.nft_mint = ctx.accounts.nft_mint.key();
        receipt.start_time = clock.unix_timestamp;
        receipt.principal = LTV_AMOUNT;
        receipt.status = LoanStatus::Active;
        receipt.bump = ctx.bumps.loan_receipt;

        msg!("Borrow successful. Dispensed 1.2 SOL. Fake NFT Exploit prevented.");
        Ok(())
    }

    pub fn repay(ctx: Context<Repay>) -> Result<()> {
        let pool = &mut ctx.accounts.global_pool;
        let receipt = &mut ctx.accounts.loan_receipt;
        let clock = Clock::get()?;
        
        require!(receipt.status == LoanStatus::Active, ErrorCode::InvalidLoanState);
        
        // Dynamic APY Calculation (Max 10% over 7 days)
        let elapsed_time = clock.unix_timestamp.checked_sub(receipt.start_time).unwrap_or(0);
        let capped_time = std::cmp::min(elapsed_time, LOAN_DURATION);
        let max_interest = LTV_AMOUNT / 10; // 10%
        let interest = (max_interest as u128)
            .checked_mul(capped_time as u128)
            .unwrap_or(0)
            .checked_div(LOAN_DURATION as u128)
            .unwrap_or(0) as u64;
            
        let total_repayment = LTV_AMOUNT.checked_add(interest).ok_or(ErrorCode::MathOverflow)?;

        // Transfer Repayment
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.borrower.to_account_info(),
                to: pool.to_account_info(),
            },
        );
        transfer(cpi_context, total_repayment)?;

        pool.total_sol = pool.total_sol.checked_add(total_repayment).ok_or(ErrorCode::MathOverflow)?;

        // Return NFT & Close Escrow
        let bump_bytes = pool.bump.to_le_bytes();
        let seeds = &[b"pool".as_ref(), bump_bytes.as_ref()];
        let signer = &[&seeds[..]];

        let cpi_accounts = SplTransfer {
            from: ctx.accounts.escrow_nft_account.to_account_info(),
            to: ctx.accounts.borrower_nft_account.to_account_info(),
            authority: pool.to_account_info(),
        };
        token::transfer(
            CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts, signer),
            1,
        )?;
        
        // Close the escrow token account to prevent bloat and refund rent
        token::close_account(CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::CloseAccount {
                account: ctx.accounts.escrow_nft_account.to_account_info(),
                destination: ctx.accounts.borrower.to_account_info(),
                authority: pool.to_account_info(),
            },
            signer,
        ))?;

        receipt.status = LoanStatus::Repaid;
        msg!("Repaid {} SOL. NFT Returned. APY dynamically calculated.", total_repayment);
        Ok(())
    }

    pub fn seize_collateral(ctx: Context<SeizeCollateral>) -> Result<()> {
        let receipt = &mut ctx.accounts.loan_receipt;
        let clock = Clock::get()?;

        require!(receipt.status == LoanStatus::Active, ErrorCode::InvalidLoanState);
        
        let elapsed_time = clock.unix_timestamp.checked_sub(receipt.start_time).unwrap_or(0);
        require!(elapsed_time > LOAN_DURATION, ErrorCode::LoanNotExpired);

        let pool = &ctx.accounts.global_pool;
        let bump_bytes = pool.bump.to_le_bytes();
        let seeds = &[b"pool".as_ref(), bump_bytes.as_ref()];
        let signer = &[&seeds[..]];

        let cpi_accounts = SplTransfer {
            from: ctx.accounts.escrow_nft_account.to_account_info(),
            to: ctx.accounts.admin_vault_account.to_account_info(),
            authority: pool.to_account_info(),
        };
        token::transfer(
            CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts, signer),
            1,
        )?;

        // Close the escrow account and send rent to pool
        token::close_account(CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::CloseAccount {
                account: ctx.accounts.escrow_nft_account.to_account_info(),
                destination: pool.to_account_info(),
                authority: pool.to_account_info(),
            },
            signer,
        ))?;

        receipt.status = LoanStatus::PendingRepo;
        receipt.keeper = ctx.accounts.keeper.key(); 

        msg!("Loan defaulted. NFT moved to Admin Vault. Escrow closed.");
        Ok(())
    }

    pub fn admin_withdraw_vault(ctx: Context<AdminWithdrawVault>) -> Result<()> {
        let pool = &ctx.accounts.global_pool;
        
        let bump_bytes = pool.bump.to_le_bytes();
        let seeds = &[b"pool".as_ref(), bump_bytes.as_ref()];
        let signer = &[&seeds[..]];

        let cpi_accounts = SplTransfer {
            from: ctx.accounts.admin_vault_account.to_account_info(),
            to: ctx.accounts.admin_dest_account.to_account_info(),
            authority: pool.to_account_info(),
        };
        token::transfer(
            CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts, signer),
            1,
        )?;

        msg!("Admin withdrew seized NFT.");
        Ok(())
    }

    pub fn resolve_default(ctx: Context<ResolveDefault>) -> Result<()> {
        let pool = &mut ctx.accounts.global_pool;
        let receipt = &mut ctx.accounts.loan_receipt;

        require!(receipt.status == LoanStatus::PendingRepo, ErrorCode::InvalidLoanState);

        let repo_value = 2_000_000_000; // 2 SOL
        
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.admin.to_account_info(),
                to: pool.to_account_info(),
            },
        );
        transfer(cpi_context, repo_value)?;

        **pool.to_account_info().try_borrow_mut_lamports()? -= KEEPER_BOUNTY;
        **ctx.accounts.keeper.try_borrow_mut_lamports()? += KEEPER_BOUNTY;

        pool.total_sol = pool.total_sol.checked_add(repo_value.checked_sub(KEEPER_BOUNTY).ok_or(ErrorCode::MathOverflow)?).ok_or(ErrorCode::MathOverflow)?;
        receipt.status = LoanStatus::Resolved;

        msg!("Repo Resolved. 2 SOL recovered.");
        Ok(())
    }
}

// ----------------------------------------------------
// ACCOUNTS
// ----------------------------------------------------

#[account]
pub struct GlobalPool {
    pub admin: Pubkey,
    pub total_sol: u64,
    pub total_shares: u64,
    pub bump: u8,
}

#[account]
pub struct LoanReceipt {
    pub borrower: Pubkey,
    pub nft_mint: Pubkey,
    pub principal: u64,
    pub start_time: i64,
    pub status: LoanStatus,
    pub keeper: Pubkey,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum LoanStatus {
    Active,
    Repaid,
    PendingRepo,
    Resolved,
}

// ----------------------------------------------------
// INSTRUCTION CONTEXTS
// ----------------------------------------------------

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(init, payer = admin, space = 8 + 32 + 8 + 8 + 1, seeds = [b"pool"], bump)]
    pub global_pool: Account<'info, GlobalPool>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositLiquidity<'info> {
    #[account(mut, seeds = [b"pool"], bump = global_pool.bump)]
    pub global_pool: Account<'info, GlobalPool>,
    #[account(mut)]
    pub lender: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Borrow<'info> {
    #[account(mut, seeds = [b"pool"], bump = global_pool.bump)]
    pub global_pool: Account<'info, GlobalPool>,
    #[account(init, payer = borrower, space = 8 + 32 + 32 + 8 + 8 + 1 + 32 + 1, seeds = [b"receipt", borrower.key().as_ref(), nft_mint.key().as_ref()], bump)]
    pub loan_receipt: Box<Account<'info, LoanReceipt>>,
    #[account(mut)]
    pub borrower: Signer<'info>,
    pub nft_mint: Account<'info, Mint>,
    #[account(mut, constraint = borrower_nft_account.mint == nft_mint.key() && borrower_nft_account.owner == borrower.key())]
    pub borrower_nft_account: Box<Account<'info, TokenAccount>>,
    /// CHECK: Metaplex Metadata Account
    pub nft_metadata: UncheckedAccount<'info>,
    #[account(init, payer = borrower, token::mint = nft_mint, token::authority = global_pool, seeds = [b"escrow", nft_mint.key().as_ref()], bump)]
    pub escrow_nft_account: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Repay<'info> {
    #[account(mut, seeds = [b"pool"], bump = global_pool.bump)]
    pub global_pool: Account<'info, GlobalPool>,
    #[account(mut, constraint = loan_receipt.borrower == borrower.key())]
    pub loan_receipt: Account<'info, LoanReceipt>,
    #[account(mut)]
    pub borrower: Signer<'info>,
    #[account(mut)]
    pub escrow_nft_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub borrower_nft_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SeizeCollateral<'info> {
    #[account(mut, seeds = [b"pool"], bump = global_pool.bump)]
    pub global_pool: Account<'info, GlobalPool>,
    #[account(mut)]
    pub loan_receipt: Account<'info, LoanReceipt>,
    #[account(mut)]
    pub keeper: Signer<'info>,
    #[account(mut)]
    pub escrow_nft_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub admin_vault_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct AdminWithdrawVault<'info> {
    #[account(mut, seeds = [b"pool"], bump = global_pool.bump, has_one = admin)]
    pub global_pool: Account<'info, GlobalPool>,
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(mut)]
    pub admin_vault_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub admin_dest_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ResolveDefault<'info> {
    #[account(mut, seeds = [b"pool"], bump = global_pool.bump)]
    pub global_pool: Account<'info, GlobalPool>,
    #[account(mut)]
    pub loan_receipt: Account<'info, LoanReceipt>,
    #[account(mut, constraint = global_pool.admin == admin.key())]
    pub admin: Signer<'info>,
    /// CHECK: Keeper address stored in receipt
    #[account(mut, address = loan_receipt.keeper)]
    pub keeper: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Not enough SOL in the pool for this loan.")]
    InsufficientLiquidity,
    #[msg("Loan is not in a valid state for this operation.")]
    InvalidLoanState,
    #[msg("The loan duration has not expired yet.")]
    LoanNotExpired,
    #[msg("Invalid Metaplex Metadata Account.")]
    InvalidMetadata,
    #[msg("NFT is not part of a collection.")]
    NotPartOfCollection,
    #[msg("NFT collection is not verified.")]
    CollectionNotVerified,
    #[msg("NFT does not belong to the Jito Cabal collection.")]
    InvalidCollection,
    #[msg("Mathematical overflow occurred.")]
    MathOverflow,
    #[msg("This action would drop the pool below rent exemption minimums.")]
    RentExemptionRisk,
}
