use yew_router::prelude::*;

#[derive(Clone, Routable, PartialEq)]
pub enum Route {
    #[at("/")]
    Home,
    #[at("/loading")]
    Loading,
    #[not_found]
    #[at("/404")]
    NotFound,
}
