use crud::Authorizer;
use sea_orm::ColumnTrait;

use crate::helper::get_user_from_ctx;

pub struct UserAuthorizer {}

#[async_trait::async_trait]
impl Authorizer for UserAuthorizer {
    async fn authorize(
        &self,
        ctx: &async_graphql::Context<'_>,
    ) -> async_graphql::Result<sea_orm::Condition> {
        let user = get_user_from_ctx(ctx).await?;
        Ok(sea_orm::Condition::all().add(model::user::Column::Id.eq(user.id)))
    }
}