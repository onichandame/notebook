use async_graphql::{Context, Object, Result};
use client::{Client, LoginInput};
use futures::StreamExt;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, Condition, DatabaseConnection, DbErr, EntityTrait,
    PaginatorTrait, QueryFilter, QuerySelect, Set, TransactionTrait,
};

use crate::helper::get_user_from_ctx;

#[derive(Default)]
pub struct SyncMutation {}

#[Object]
impl SyncMutation {
    async fn sync_from_remote(
        &self,
        ctx: &Context<'_>,
        url: String,
        identity: String,
        password: String,
    ) -> Result<bool> {
        let user = get_user_from_ctx(ctx).await?;
        let db = ctx.data::<DatabaseConnection>()?;
        let client = Client::new(&url);
        let session = client
            .login(LoginInput {
                identity: identity.clone(),
                password: password.clone(),
            })
            .await?;
        let client = client.set_session(&session);
        let mut stream = client.stream_notes().await?;
        while let Some(remote_note) = stream.next().await {
            let should_update = model::note::Entity::find()
                .filter(
                    Condition::all()
                        .add(model::note::Column::Uuid.eq(remote_note.uuid.clone()))
                        .add(
                            Condition::any()
                                .add(
                                    model::note::Column::LamportClock
                                        .gt(remote_note.lamport_clock.clone()),
                                )
                                .add(
                                    Condition::all()
                                        .add(
                                            model::note::Column::LamportClock
                                                .eq(remote_note.lamport_clock.clone()),
                                        )
                                        .add(
                                            model::note::Column::UpdatedAt
                                                .gte(remote_note.updated_at.clone()),
                                        ),
                                ),
                        ),
                )
                .offset(0)
                .limit(1)
                .count(db)
                .await?
                == 0;
            if should_update {
                db.transaction::<_, (), DbErr>(|txn| {
                    Box::pin(async move {
                        model::note::Entity::delete_many()
                            .filter(model::note::Column::Uuid.eq(remote_note.uuid.clone()))
                            .exec(txn)
                            .await?;
                        let mut active_model = model::note::ActiveModel::from(remote_note);
                        active_model.user_id = Set(user.id);
                        active_model.insert(txn).await?;
                        Ok(())
                    })
                })
                .await?;
            }
        }
        Ok(true)
    }
}