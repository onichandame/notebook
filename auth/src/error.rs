use thiserror::Error;

#[derive(Error, Debug)]
pub enum AuthError {
    #[error("password incorrect")]
    IncorrectPassword,
}
