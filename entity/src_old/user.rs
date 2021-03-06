//! SeaORM Entity. Generated by sea-orm-codegen 0.7.0

use sea_orm::{entity::prelude::*, IntoActiveModel, Set};

use crate::{conversion::IntoActiveValue, error::Error};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "users")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: i32,
    pub created_at: DateTime,
    pub updated_at: Option<DateTime>,
    pub deleted_at: Option<DateTime>,
    pub name: String,
    pub password: String,
    pub email: Option<String>,
    pub avatar: Option<String>,
}
#[derive(Default)]
pub struct Update {
    pub name: Option<String>,
    pub password: Option<String>,
    pub email: Option<Option<String>>,
    pub avatar: Option<Option<String>>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::note::Entity")]
    Notes,
    #[sea_orm(has_many = "super::password_group::Entity")]
    PasswordGroups,
    #[sea_orm(has_many = "super::password::Entity")]
    Passwords,
}

impl Related<super::note::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Notes.def()
    }
}

impl Related<super::password_group::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::PasswordGroups.def()
    }
}

impl Related<super::password::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Passwords.def()
    }
}

impl ActiveModelBehavior for ActiveModel {
    fn before_save(mut self, insert: bool) -> Result<Self, DbErr> {
        if self.password.is_set() {
            self.password = Set(bcrypt::hash(
                self.password
                    .take()
                    .ok_or(DbErr::Type("password is set but has no value".to_owned()))?,
                bcrypt::DEFAULT_COST,
            )
            .map_err(|_| DbErr::Custom("failed to hash password".to_owned()))?);
        }
        if insert {
            self.created_at = Set(chrono::Utc::now().naive_utc())
        } else {
            self.updated_at = Set(Some(chrono::Utc::now().naive_utc()))
        }
        Ok(self)
    }
}

impl Model {
    pub fn check_password(&self, password: &str) -> Result<bool, Error> {
        Ok(bcrypt::verify(password, &self.password)?)
    }
}

impl IntoActiveModel<ActiveModel> for Update {
    fn into_active_model(self) -> ActiveModel {
        ActiveModel {
            name: self.name.into_active_value(),
            password: self.password.into_active_value(),
            email: self.email.into_active_value(),
            avatar: self.avatar.into_active_value(),
            ..Default::default()
        }
    }
}

#[cfg(test)]
mod tests {
    use sea_orm::Unchanged;

    use super::*;
    fn get_default_model() -> Model {
        Model {
            avatar: None,
            email: None,
            created_at: chrono::NaiveDateTime::from_timestamp(0, 0),
            deleted_at: None,
            updated_at: None,
            id: 0,
            name: "".to_owned(),
            password: "".to_owned(),
        }
    }
    #[test]
    fn hash_password() -> Result<(), Error> {
        // hash before insert
        let mut password = "asdf".to_owned();
        let mut model = get_default_model();
        let mut active_model: ActiveModel = model.clone().into();
        active_model.password = Set(password.clone());
        active_model = active_model.before_save(true)?;
        assert_ne!(&password, active_model.password.as_ref());
        model.password = active_model.password.as_ref().to_owned();
        assert!(model.check_password(&password)?);
        // don't hash if not changed
        let hashed_password = active_model.password.as_ref().to_owned();
        active_model.password = Unchanged(hashed_password.clone());
        active_model = active_model.before_save(false)?;
        assert_eq!(&hashed_password, active_model.password.as_ref());
        // hash if changed in update
        password = "zxcv".to_owned();
        active_model.password = Set(password.clone());
        active_model = active_model.before_save(false)?;
        assert_ne!(&hashed_password, active_model.password.as_ref());
        model.password = active_model.password.as_ref().to_owned();
        assert!(model.check_password(&password)?);
        Ok(())
    }
}
