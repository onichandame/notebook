use async_graphql::{async_trait::async_trait, Context, Guard, Result};

use crate::auth::Session;

#[derive(Default)]
pub struct NotLoggedIn {}

#[async_trait]
impl Guard for NotLoggedIn {
    async fn check(&self, ctx: &Context<'_>) -> Result<()> {
        match ctx.data::<Session>() {
            Ok(_) => Err("user logged in".into()),
            Err(_) => Ok(()),
        }
    }
}
