//! SeaORM Entity. Generated by sea-orm-codegen 0.7.0

use sea_orm::{entity::prelude::*, Set};
use serde::Deserialize;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Deserialize)]
#[serde(rename_all = "camelCase")]
#[sea_orm(table_name = "notes")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: i32,
    pub uuid: String,
    pub lamport_clock: i32,
    pub created_at: DateTime,
    pub updated_at: Option<DateTime>,
    pub deleted_at: Option<DateTimeUtc>,
    pub user_id: i32,
    pub title: String,
    pub content: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::user::Entity",
        from = "Column::UserId",
        to = "super::user::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    User,
}

impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

impl ActiveModelBehavior for ActiveModel {
    fn before_save(mut self, insert: bool) -> Result<Self, DbErr> {
        if insert {
            self.lamport_clock = Set(0);
        } else {
            self.lamport_clock = Set(self.lamport_clock.take().ok_or(DbErr::Custom(
                "lamport clock not found before update".to_owned(),
            ))? + 1);
            self.updated_at = if self.updated_at.is_not_set() {
                Set(Some(chrono::Utc::now().naive_utc()))
            } else {
                self.updated_at
            };
        }
        Ok(self)
    }
}
