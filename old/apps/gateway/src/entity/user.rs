//! SeaORM Entity. Generated by sea-orm-codegen 0.9.2

use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "user")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub created_at: DateTime,
    pub updated_at: Option<DateTime>,
    #[sea_orm(column_type = "Text", unique)]
    pub name: String,
    #[sea_orm(column_type = "Text", nullable)]
    pub email: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub avatar: Option<String>,
    pub invitation_id: Option<i32>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::invitation::Entity",
        from = "Column::InvitationId",
        to = "super::invitation::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    Invitation,
    #[sea_orm(has_many = "super::credential::Entity")]
    Credential,
    #[sea_orm(has_many = "super::memo::Entity")]
    Memo,
}

impl Related<super::invitation::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Invitation.def()
    }
}

impl Related<super::credential::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Credential.def()
    }
}

impl Related<super::memo::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Memo.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}