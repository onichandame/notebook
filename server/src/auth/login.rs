use async_graphql::Result;
use entity::prelude::*;
use sea_orm::{
    ColumnTrait, Condition, DatabaseConnection, EntityTrait, ModelTrait, QueryFilter, QueryOrder,
};

use super::Session;

pub async fn login_by_password(
    identity: &str,
    password: &str,
    db: &DatabaseConnection,
) -> Result<Session> {
    let user = User::find()
        .filter(
            Condition::any()
                .add(entity::user::Column::Email.eq(identity.clone()))
                .add(entity::user::Column::Name.eq(identity.clone())),
        )
        .one(db)
        .await?
        .ok_or("user not found")?;
    let credential = user
        .find_related(Credential)
        .filter(entity::credential::Column::DeletedAt.is_null())
        .order_by_desc(entity::credential::Column::CreatedAt)
        .one(db)
        .await?;
    match credential {
        Some(cred) => {
            if !bcrypt::verify(password, &cred.password)? {
                return Err("password do not match".into());
            }
        }
        None => {}
    };
    Ok(Session::encode(&user, db).await?)
}
