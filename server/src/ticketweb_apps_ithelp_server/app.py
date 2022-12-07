import falcon

from ticketweb_rt_interface.handlers import UserData
from .handlers import SubmitTicketOnboarding



from .handlers import BadRequest
from .config_data import config_data




def main():
   api = falcon.App()
   api.add_route('/user-data', UserData(config_data))
   api.add_route('/submit-ticket/onboarding', SubmitTicketOnboarding())
   api.add_error_handler(BadRequest) 
   return api
