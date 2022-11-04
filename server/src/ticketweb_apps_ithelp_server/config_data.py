import sys
import json
import os

if sys.base_prefix != sys.prefix:
    _etc_path = sys.prefix + "/etc"
else:
    _etc_path = "/etc"




def _get_config_data_all():
    ldap_file = os.path.join(_etc_path,"ticketweb/applications/ithelp/app-server-config.json")

    f = open(ldap_file,"r")
    ldap_data = json.load(f)
    f.close()
    return ldap_data


config_data = _get_config_data_all()