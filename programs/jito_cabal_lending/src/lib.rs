use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use std::str::FromStr;
use mpl_core::accounts::BaseAssetV1;
use mpl_core::types::UpdateAuthority;
use mpl_core::instructions::TransferV1CpiBuilder;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("EazAH8Adyino7uConjZfYdjFqmjqfm7vBtTsba3Ejg39");

pub const LTV_AMOUNT: u64 = 1_200_000_000; // 1.2 SOL
pub const LOAN_DURATION: i64 = 7 * 24 * 60 * 60; // 7 days in seconds
pub const KEEPER_BOUNTY: u64 = 20_000_000; // 0.02 SOL
pub const REPO_VALUE: u64 = 2_000_000_000; // 2 SOL – admin buyback on default resolution

// Real Jito Cabal Verified Collection Mint
pub const CABAL_COLLECTION: &str = "F7YJeY3wPhgUCvV4EKEKWx7YgNENG21178BHMujz6BzU";

#[program]
pub mod jito_cabal_lending {
    use super::*;

    pub fn initialize_pool(ctx: Context<InitializePool>) -> Result<()> {
        let pool = &mut ctx.accounts.global_pool;
        pool.admin = ctx.accounts.admin.key();
        pool.total_sol = 0;
        pool.lp_mint = ctx.accounts.lp_mint.key();
        pool.bump = ctx.bumps.global_pool;
        msg!("Jito Cabal Lending Pool Initialized. Admin: {}, LP Mint: {}", pool.admin, pool.lp_mint);
        Ok(())
    }

    pub fn deposit_liquidity(ctx: Context<DepositLiquidity>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::ZeroAmount);
        let pool = &mut ctx.accounts.global_pool;
        
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.lender.to_account_info(),
                to: pool.to_account_info(),
            },
        );
        transfer(cpi_context, amount)?;

        let total_sol = pool.total_sol;
        let total_shares = ctx.accounts.lp_mint.supply;

        let shares = if total_sol == 0 || total_shares == 0 {
            amount
        } else {
            (amount as u128)
                .checked_mul(total_shares as u128)
                .ok_or(ErrorCode::MathOverflow)?
                .checked_div(total_sol as u128)
                .ok_or(ErrorCode::MathOverflow)? as u64
        };

        pool.total_sol = pool.total_sol.checked_add(amount).ok_or(ErrorCode::MathOverflow)?;

        // Mint LP shares to lender using pool seeds as authority
        let pool_bump = pool.bump;
        let seeds = &[b"pool".as_ref(), &[pool_bump]];
        let signer = &[&seeds[..]];

        let cpi_mint = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.lp_mint.to_account_info(),
                to: ctx.accounts.lender_lp_ata.to_account_info(),
                authority: pool.to_account_info(),
            },
            signer,
        );
        token::mint_to(cpi_mint, shares)?;

        msg!("Deposited {} SOL. Issued {} LP Shares.", amount, shares);
        Ok(())
    }

    pub fn withdraw_liquidity(ctx: Context<WithdrawLiquidity>, shares: u64) -> Result<()> {
        require!(shares > 0, ErrorCode::ZeroShares);
        let pool = &mut ctx.accounts.global_pool;
        let total_shares = ctx.accounts.lp_mint.supply;
        require!(total_shares >= shares, ErrorCode::InsufficientShares);
        
        let amount = (shares as u128)
            .checked_mul(pool.total_sol as u128)
            .ok_or(ErrorCode::MathOverflow)?
            .checked_div(total_shares as u128)
            .ok_or(ErrorCode::MathOverflow)? as u64;

        let rent_minimum = Rent::get()?.minimum_balance(pool.to_account_info().data_len());
        let current_lamports = pool.to_account_info().lamports();
        require!(current_lamports.checked_sub(amount).ok_or(ErrorCode::MathOverflow)? >= rent_minimum, ErrorCode::RentExemptionRisk);

        pool.total_sol = pool.total_sol.checked_sub(amount).ok_or(ErrorCode::MathOverflow)?;

        // Burn LP tokens from lender's Associated Token Account
        let cpi_burn = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Burn {
                mint: ctx.accounts.lp_mint.to_account_info(),
                from: ctx.accounts.lender_lp_ata.to_account_info(),
                authority: ctx.accounts.lender.to_account_info(),
            },
        );
        token::burn(cpi_burn, shares)?;

        // Transfer SOL from Pool PDA to Lender
        **pool.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.lender.try_borrow_mut_lamports()? += amount;

        msg!("Withdrew {} SOL. Burned {} Shares.", amount, shares);
        Ok(())
    }

    pub fn borrow(ctx: Context<Borrow>) -> Result<()> {
        let clock = Clock::get()?;

        // 1. Strict Metaplex Core Verification
        // Verify owner is Metaplex Core Program
        require_keys_eq!(ctx.accounts.nft_asset.owner.key(), mpl_core::ID, ErrorCode::InvalidMetadata);
        
        let asset = BaseAssetV1::try_deserialize(&mut &ctx.accounts.nft_asset.try_borrow_data()?[..])?;
        
        // Verify current owner of the asset is the borrower
        require_keys_eq!(asset.owner, ctx.accounts.borrower.key(), ErrorCode::InvalidOwner);
        
        // Verify collection link via UpdateAuthority
        let collection_key = match asset.update_authority {
            UpdateAuthority::Collection(key) => key,
            _ => return err!(ErrorCode::NotPartOfCollection),
        };
        
        let expected_collection_pubkey = Pubkey::from_str(CABAL_COLLECTION).unwrap();
        require_keys_eq!(collection_key, expected_collection_pubkey, ErrorCode::InvalidCollection);

        // 2. Rent-Exemption Safety Check & Pool SOL deductions in scoped block to avoid E0502
        {
            let pool = &mut ctx.accounts.global_pool;
            let rent_minimum = Rent::get()?.minimum_balance(pool.to_account_info().data_len());
            require!(pool.total_sol >= LTV_AMOUNT, ErrorCode::InsufficientLiquidity);
            
            let current_lamports = pool.to_account_info().lamports();
            require!(current_lamports.checked_sub(LTV_AMOUNT).ok_or(ErrorCode::MathOverflow)? >= rent_minimum, ErrorCode::RentExemptionRisk);

            pool.total_sol = pool.total_sol.checked_sub(LTV_AMOUNT).ok_or(ErrorCode::MathOverflow)?;
        }

        // 3. Transfer Metaplex Core NFT directly to Pool PDA
        TransferV1CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
            .asset(&ctx.accounts.nft_asset.to_account_info())
            .new_owner(&ctx.accounts.global_pool.to_account_info())
            .payer(&ctx.accounts.borrower.to_account_info())
            .collection(Some(&ctx.accounts.nft_collection.to_account_info()))
            .authority(Some(&ctx.accounts.borrower.to_account_info()))
            .invoke()?;

        // 4. Dispense SOL
        **ctx.accounts.global_pool.to_account_info().try_borrow_mut_lamports()? -= LTV_AMOUNT;
        **ctx.accounts.borrower.try_borrow_mut_lamports()? += LTV_AMOUNT;

        // 5. Initialize Receipt
        let receipt = &mut ctx.accounts.loan_receipt;
        receipt.borrower = ctx.accounts.borrower.key();
        receipt.nft_mint = ctx.accounts.nft_asset.key(); // Save the asset key as the mint reference
        receipt.start_time = clock.unix_timestamp;
        receipt.principal = LTV_AMOUNT;
        receipt.status = LoanStatus::Active;
        receipt.bump = ctx.bumps.loan_receipt;

        msg!("Borrow successful. Dispensed 1.2 SOL. Core NFT verified and escrowed.");
        Ok(())
    }

    pub fn repay(ctx: Context<Repay>) -> Result<()> {
        let clock = Clock::get()?;
        let receipt = &mut ctx.accounts.loan_receipt;
        
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
                to: ctx.accounts.global_pool.to_account_info(),
            },
        );
        transfer(cpi_context, total_repayment)?;

        // Scoped block to safely update pool total SOL before CPI
        let global_pool_bump = {
            let pool = &mut ctx.accounts.global_pool;
            pool.total_sol = pool.total_sol.checked_add(total_repayment).ok_or(ErrorCode::MathOverflow)?;
            pool.bump
        };

        // Return Metaplex Core NFT to Borrower
        let bump_bytes = global_pool_bump.to_le_bytes();
        let seeds = &[b"pool".as_ref(), bump_bytes.as_ref()];
        let signer = &[&seeds[..]];

        TransferV1CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
            .asset(&ctx.accounts.nft_asset.to_account_info())
            .new_owner(&ctx.accounts.borrower.to_account_info())
            .payer(&ctx.accounts.borrower.to_account_info())
            .collection(Some(&ctx.accounts.nft_collection.to_account_info()))
            .authority(Some(&ctx.accounts.global_pool.to_account_info()))
            .invoke_signed(signer)?;

        receipt.status = LoanStatus::Repaid;
        msg!("Repaid {} SOL. Core NFT returned to borrower.", total_repayment);
        Ok(())
    }

    pub fn seize_collateral(ctx: Context<SeizeCollateral>) -> Result<()> {
        let receipt = &mut ctx.accounts.loan_receipt;
        let clock = Clock::get()?;

        require!(receipt.status == LoanStatus::Active, ErrorCode::InvalidLoanState);
        
        let elapsed_time = clock.unix_timestamp.checked_sub(receipt.start_time).unwrap_or(0);
        require!(elapsed_time > LOAN_DURATION, ErrorCode::LoanNotExpired);

        let global_pool_bump = ctx.accounts.global_pool.bump;
        let bump_bytes = global_pool_bump.to_le_bytes();
        let seeds = &[b"pool".as_ref(), bump_bytes.as_ref()];
        let signer = &[&seeds[..]];

        // Direct-to-Wallet repossession: Transfer directly to admin's wallet
        TransferV1CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
            .asset(&ctx.accounts.nft_asset.to_account_info())
            .new_owner(&ctx.accounts.admin.to_account_info())
            .payer(&ctx.accounts.keeper.to_account_info())
            .collection(Some(&ctx.accounts.nft_collection.to_account_info()))
            .authority(Some(&ctx.accounts.global_pool.to_account_info()))
            .invoke_signed(signer)?;

        receipt.status = LoanStatus::PendingRepo;
        receipt.keeper = ctx.accounts.keeper.key(); 

        msg!("Loan defaulted. Core NFT moved directly to Admin Wallet.");
        Ok(())
    }

    pub fn resolve_default(ctx: Context<ResolveDefault>) -> Result<()> {
        let pool = &mut ctx.accounts.global_pool;
        let receipt = &mut ctx.accounts.loan_receipt;

        require!(receipt.status == LoanStatus::PendingRepo, ErrorCode::InvalidLoanState);

        let repo_value = REPO_VALUE;
        
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

        msg!("Repo Resolved. 2 SOL recovered. Keeper bounty paid.");
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
    pub lp_mint: Pubkey,
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
    #[account(init, payer = admin, space = 8 + 32 + 8 + 32 + 1, seeds = [b"pool"], bump)]
    pub global_pool: Account<'info, GlobalPool>,

    #[account(
        init,
        payer = admin,
        mint::decimals = 9,
        mint::authority = global_pool,
        seeds = [b"mint"],
        bump
    )]
    pub lp_mint: Account<'info, Mint>,

    #[account(mut)]
    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct DepositLiquidity<'info> {
    #[account(mut, seeds = [b"pool"], bump = global_pool.bump)]
    pub global_pool: Account<'info, GlobalPool>,

    #[account(mut, seeds = [b"mint"], bump)]
    pub lp_mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = lender,
        associated_token::mint = lp_mint,
        associated_token::authority = lender,
    )]
    pub lender_lp_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub lender: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawLiquidity<'info> {
    #[account(mut, seeds = [b"pool"], bump = global_pool.bump)]
    pub global_pool: Account<'info, GlobalPool>,

    #[account(mut, seeds = [b"mint"], bump)]
    pub lp_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = lp_mint,
        associated_token::authority = lender,
    )]
    pub lender_lp_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub lender: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Borrow<'info> {
    #[account(mut, seeds = [b"pool"], bump = global_pool.bump)]
    pub global_pool: Account<'info, GlobalPool>,
    #[account(init, payer = borrower, space = 8 + 32 + 32 + 8 + 8 + 1 + 32 + 1, seeds = [b"receipt", borrower.key().as_ref(), nft_asset.key().as_ref()], bump)]
    pub loan_receipt: Box<Account<'info, LoanReceipt>>,
    #[account(mut)]
    pub borrower: Signer<'info>,
    /// CHECK: Metaplex Core Asset Account
    #[account(mut)]
    pub nft_asset: AccountInfo<'info>,
    /// CHECK: Metaplex Core Collection Account
    #[account(constraint = nft_collection.key() == Pubkey::from_str(CABAL_COLLECTION).unwrap() @ ErrorCode::InvalidCollection)]
    pub nft_collection: AccountInfo<'info>,
    /// CHECK: Metaplex Core Program
    pub mpl_core_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Repay<'info> {
    #[account(mut, seeds = [b"pool"], bump = global_pool.bump)]
    pub global_pool: Account<'info, GlobalPool>,
    #[account(
        mut, 
        close = borrower, 
        seeds = [b"receipt", borrower.key().as_ref(), nft_asset.key().as_ref()], 
        bump = loan_receipt.bump,
        constraint = loan_receipt.borrower == borrower.key() && loan_receipt.nft_mint == nft_asset.key()
    )]
    pub loan_receipt: Box<Account<'info, LoanReceipt>>,
    #[account(mut)]
    pub borrower: Signer<'info>,
    /// CHECK: Metaplex Core Asset Account
    #[account(mut)]
    pub nft_asset: AccountInfo<'info>,
    /// CHECK: Metaplex Core Collection Account
    #[account(constraint = nft_collection.key() == Pubkey::from_str(CABAL_COLLECTION).unwrap() @ ErrorCode::InvalidCollection)]
    pub nft_collection: AccountInfo<'info>,
    /// CHECK: Metaplex Core Program
    pub mpl_core_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SeizeCollateral<'info> {
    #[account(mut, seeds = [b"pool"], bump = global_pool.bump)]
    pub global_pool: Account<'info, GlobalPool>,
    #[account(
        mut, 
        seeds = [b"receipt", loan_receipt.borrower.key().as_ref(), nft_asset.key().as_ref()], 
        bump = loan_receipt.bump,
        constraint = loan_receipt.nft_mint == nft_asset.key()
    )]
    pub loan_receipt: Account<'info, LoanReceipt>,
    #[account(mut)]
    pub keeper: Signer<'info>,
    /// CHECK: Metaplex Core Asset Account
    #[account(mut)]
    pub nft_asset: AccountInfo<'info>,
    /// CHECK: Metaplex Core Collection Account
    #[account(constraint = nft_collection.key() == Pubkey::from_str(CABAL_COLLECTION).unwrap() @ ErrorCode::InvalidCollection)]
    pub nft_collection: AccountInfo<'info>,
    /// CHECK: Metaplex Core Program
    pub mpl_core_program: AccountInfo<'info>,
    /// CHECK: Admin recipient wallet
    #[account(mut, address = global_pool.admin)]
    pub admin: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveDefault<'info> {
    #[account(mut, seeds = [b"pool"], bump = global_pool.bump)]
    pub global_pool: Account<'info, GlobalPool>,
    #[account(
        mut, 
        close = admin,
        seeds = [b"receipt", loan_receipt.borrower.key().as_ref(), loan_receipt.nft_mint.key().as_ref()],
        bump = loan_receipt.bump
    )]
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
    #[msg("Lender has requested to withdraw more shares than they own.")]
    InsufficientShares,
    #[msg("Borrower is not the owner of the NFT.")]
    InvalidOwner,
    #[msg("Deposit amount must be greater than zero.")]
    ZeroAmount,
    #[msg("Shares to withdraw must be greater than zero.")]
    ZeroShares,
}
