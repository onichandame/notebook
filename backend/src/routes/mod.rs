use sea_orm::DatabaseConnection;
use warp::{Filter, Rejection, Reply};

use crate::{config::Config, schema::Schema};

use self::{
    api::create_api_route, content::create_content_route, error::handle_error,
    health::create_health_route,
};

mod api;
mod content;
mod error;
mod health;
mod middlewares;

pub fn create_routes(
    schema: Schema,
    config: &Config,
    db: &DatabaseConnection,
) -> impl Filter<Extract = (impl Reply,), Error = Rejection> + Clone {
    let api_route = warp::path(config.api_root.clone())
        .and(warp::path::end())
        .and(create_api_route(schema, db));
    let content_route =
        warp::path(config.content_root.clone()).and(create_content_route(&config.content_dir, db));
    let health_route = warp::path(config.health_root.clone()).and(create_health_route());

    api_route
        .or(content_route)
        .or(health_route)
        .recover(handle_error)
}