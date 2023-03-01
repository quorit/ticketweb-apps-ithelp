import Vue from 'vue'
import VueRouter from 'vue-router'
import OnboardingForm from '../views/Onboarding.vue'
import ErrorPage from '../views/ErrorPage.vue'
import LoginForm from '../views/Login.vue'

const authsystem_network = require ("authsystem_network");
import {get_error_params} from '../js_extra/web_project_error.js'
import store from '../store'

Vue.use(VueRouter);






const routes = [
    {
        path: '/forms/:type(onboarding)',
        component: OnboardingForm,
        name: "onboarding_form"
    },
    {
        path: '/login/:type(onboarding)',
        component: LoginForm,
        name: "login"
    },
    {
        path: '/error/:error_type/:status_code?',
        component: ErrorPage,
        name: 'error_page',
        // eslint-disable-next-line no-unused-vars
        props: true
    }

];



function scrollBehavior (to, from, savedPosition){
    if (savedPosition){
        return savedPosition;
    }else{
        return {x:0, y:0};
    }
}

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior
});






const config_data = JSON.parse(process.env.VUE_APP_CONFIG_DATA);

const authsystem_path = config_data.vue_app_path_roots.authsystem;
const login_portal_info = config_data.login_portal_info;


router.beforeEach(async (to,from,next) => {
    function next_login(){
        console.log(config_data)
        //here 'to' is assumed to be either reporting_support_form or
        //reporting_request forms
        const type = to.params.type
        const server_root = login_portal_info.server_root;
        const page_map = login_portal_info.page_maps[type];
        const login_url=server_root+ "frontend/" + page_map

        location.replace(login_url)

    }

    

    if((to.name == 'onboarding_form')){


        try{       
            const access_token=(to.query)["access-token"];
            console.log(access_token);
            console.log("Did you even get here?")
            var json_data;
            if(access_token){
                json_data = await authsystem_network.get_app_token(authsystem_path,"ithelp",access_token)
            }else{
                json_data = await authsystem_network.get_app_token(authsystem_path,"ithelp");
            }
            const user_data=json_data.user_data;
            store.commit('set_user_data',user_data);

            //Note that I am re-fetching the user data every time we go to a new page (other than login or error).
            //This is because in another window the user could log out and log in as someone else.
            //and if this app were any more involved, there would be links going from one route to another
            //*within* the app (the app does not reload when you navigate *within the app* links).
            //If that were to happen the user data would remain unchanged even if the user logged in as someone else.
            
            //If not for this problem we could load the user data in App.vue when the app (re)loads or
            //on login, if the user wasn't logged in when the app reloads.
            //The app reloads whenever the user navigates to a page in the website or when the
            //user manually changes the url in the url bar.
            //However that's not good enough because in a vue app a route change does not always imply an
            //app reload, and the user *can* change without an app reload, because a log our and login can occur
            //in a different tab/windows and the session cookies do not pertain to specific
            //browser window or tab.

            //In the case of *this* particular app, there are no in-app links, so it's impossible
            //to go to from one page to another without reloading the app, but we are not assuming
            //that the app will always be limited in this way.
        } catch (e) {
            if (e instanceof authsystem_network.SessionAuthenticationError){
                //this should cover...missing session cookie, expired session
                //anyhitng that would result in an "401 Unauthorized". Don't forget that
                //the language of 'Unauthorized' in HTTP codes is wrong
                //and really refers to authentication problems.
                next_login();
                return;
            }else{

                const error_params=get_error_params(e);

                next( {                    
                    name: "error_page",
                    params: error_params
                });
                return;
            }

        }
    }
    next();
 });


export default router
