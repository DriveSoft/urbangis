import { fetchUrl2 } from "../utils/misc"
import { URL_GET_PERMISSIONS } from '../constants/urlsAPI';
import i18next from '../i18nextConf.js'

export const initPermissions = () => {
    return {
    is_superuser: false,
    tree: {       
        view_tree: {
            granted: false,
            deniedMessage: i18next.t('permsMessages.tree.view_tree')
        },
        add_tree: {
            granted: false,
            deniedMessage: i18next.t('permsMessages.tree.add_tree')
        },
        change_tree: {
            granted: false,
            deniedMessage: i18next.t('permsMessages.tree.change_tree')
        },
        can_change_not_own_tree_record: {
            granted: false,
            deniedMessage: i18next.t('permsMessages.tree.can_change_not_own_tree_record')
        },   
        can_delete_not_own_tree_record: {
            granted: false,
            deniedMessage: i18next.t('permsMessages.tree.can_delete_not_own_tree_record')
        },                         
        delete_tree: {
            granted: false,
            deniedMessage: i18next.t('permsMessages.tree.delete_tree')
        },        
    },

    inspection: {
        view_inspection: {
            granted: false,
            deniedMessage: i18next.t('permsMessages.inspection.view_inspection')
        },   
        add_inspection: {
            granted: false,
            deniedMessage: i18next.t('permsMessages.inspection.add_inspection')
        },   
        change_inspection: {
            granted: false,
            deniedMessage: i18next.t('permsMessages.inspection.change_inspection')
        },  
        can_change_not_own_insp_record: {
            granted: false,
            deniedMessage: i18next.t('permsMessages.inspection.can_change_not_own_insp_record')
        },   
        can_delete_not_own_insp_record: {
            granted: false,
            deniedMessage: i18next.t('permsMessages.inspection.can_delete_not_own_insp_record')
        },                              
        delete_inspection: {
            granted: false,
            deniedMessage: i18next.t('permsMessages.inspection.delete_inspection')
        }                                
    },

    careactivity: {
        view_careactivity: {
            granted: false,
            deniedMessage: ""
        }             
    },
    }
}



export const has_perm = (permObject: any, model: string, permName: string, authToken: any) => {
    
    if (!authToken) {
        alert('Authorization required');
        return false;
    }

    if (permObject?.is_superuser === true) return true;
    
    console.log('has_perm value', permObject);    

    if(permObject) {
        if(permObject.hasOwnProperty(model) && permObject[model].hasOwnProperty(permName)) {
            if (permObject[model][permName]?.granted === true) {
                return true;
            } else {
                const deniedMessage = permObject[model][permName]?.deniedMessage;                
                if (deniedMessage) alert(deniedMessage);   
            }                
        }
        return false;
    }
    console.log('has_perm', 'permObject is not exists');
    console.log('has_perm value', permObject);
    return false;
}

export async function getCurrentUserPermissions(authToken: any) {
    try {

        const fetchResult = await fetchUrl2(URL_GET_PERMISSIONS, "GET", undefined, authToken.access);
        if (fetchResult && authToken?.user) {						    
            console.log('getCurrentUserPermissions', fetchResult);
            
            const initPermissionsRes = initPermissions();
            const currentPermissions = {...initPermissionsRes};
            currentPermissions.is_superuser = fetchResult.is_superuser;									

            if (fetchResult?.citytree) {
                for (const model in fetchResult['citytree']) {						
                    const arrayPerms = fetchResult['citytree'][model];					
                    if (Array.isArray(arrayPerms)) {							
                        arrayPerms.forEach((perm) => {                            
                            //@ts-ignore
                            currentPermissions[model][perm] = {...currentPermissions[model][perm], granted: true};
                        })							
                    }
                }
            }
            console.log('currentPermissions', currentPermissions);
            return currentPermissions; 
            //dispatch(actDataPermissions(currentPermissions));

            								
        }        
        console.log('URL_GET_PERMISSIONS', fetchResult);
        return null;    

    } catch(err) {
        console.log('getCurrentUserPermissions', err);        
    }
}	