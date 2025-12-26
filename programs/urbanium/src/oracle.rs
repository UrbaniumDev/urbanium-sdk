use anchor_lang::prelude::*;
use pyth_sdk_solana::{load_price_feed_from_account_info, Price};

use crate::errors::UrbaniumError;

#[derive(Clone, Copy, Debug)]
pub struct OraclePrice {
    pub price: i64,
    pub conf: u64,
    pub expo: i32,
    pub publish_time: i64,
}

pub fn read_pyth_price(
    oracle_program: &Pubkey,
    oracle_feed_info: &AccountInfo,
    max_staleness_seconds: u64,
) -> Result<OraclePrice> {
    if oracle_feed_info.owner != oracle_program {
        return err!(UrbaniumError::InvalidOracleOwner);
    }

    let clock = Clock::get()?;
    let price_feed = load_price_feed_from_account_info(oracle_feed_info)
        .map_err(|_| error!(UrbaniumError::OraclePriceUnavailable))?;

    let maybe: Option<Price> = price_feed.get_price_no_older_than(
        clock.unix_timestamp,
        max_staleness_seconds,
    );

    let price = maybe.ok_or_else(|| error!(UrbaniumError::OracleStale))?;

    Ok(OraclePrice {
        price: price.price,
        conf: price.conf,
        expo: price.expo,
        publish_time: price.publish_time,
    })
}

pub fn enforce_confidence_bps(price: OraclePrice, max_confidence_bps: u16) -> Result<()> {
    let abs_price: i128 = i128::from(price.price).abs();
    if abs_price == 0 {
        return err!(UrbaniumError::OraclePriceUnavailable);
    }

    let conf: i128 = i128::from(price.conf);
    let bps: i128 = conf
        .checked_mul(10_000)
        .ok_or_else(|| error!(UrbaniumError::MathOverflow))?
        .checked_div(abs_price)
        .ok_or_else(|| error!(UrbaniumError::MathOverflow))?;

    if bps > i128::from(max_confidence_bps) {
        return err!(UrbaniumError::OracleConfidenceTooHigh);
    }

    Ok(())
}
