import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../views/LoginView.vue'
import PersonalInfoView from '../views/PersonalInfoView.vue'
import PrincipalView from '../views/PrincipalView.vue'
import DatabaseSelectView from '../views/DatabaseSelectView.vue'
import DeviceRegisterView from '../views/DeviceRegisterView.vue'
import { getSessionUser } from '../utils/authSession.js'
import { getSelectedDbProfile } from '../utils/dbProfile.js'
import { getDeviceRegisteredStatus } from '../utils/deviceInfo.js'

const routes = [
    {
        path: '/',
        redirect: { name: 'select-database' }
    },
    {
        path: '/select-database',
        name: 'select-database',
        component: DatabaseSelectView
    },
    {
        path: '/device-register',
        name: 'device-register',
        component: DeviceRegisterView
    },
    {
        path: '/login',
        name: 'login',
        component: LoginView
    },
    {
        path: '/personal-info',
        name: 'personal-info',
        component: PersonalInfoView
    },
    {
        path: '/principal',
        component: PrincipalView,
        children: [
            {
                path: '',
                name: 'principal',
                redirect: { name: 'principal-inicio' }
            },
            {
                path: 'inicio',
                name: 'principal-inicio',
                component: () => import('../views/dashboard/InicioPanel.vue')
            },
            {
                path: 'rutas',
                name: 'principal-rutas',
                component: () => import('../views/dashboard/RutasPanel.vue')
            },
            {
                path: 'otm-programadas',
                name: 'principal-programadas',
                component: () => import('../views/dashboard/OtmProgramadasPanel.vue')
            },
            {
                path: 'otm-correctivas',
                name: 'principal-correctivas',
                component: () => import('../views/dashboard/OtmCorrectivasPanel.vue')
            },
            {
                path: 'otm-programada-register/:id',
                name: 'otm-programada-register',
                component: () => import('../views/register/otmProgramadaRegister.vue'),
                props: true
            },
            {
                path: 'otm-correctiva-register/:id',
                name: 'otm-correctiva-register',
                component: () => import('../views/register/otmCorrectivaRegister.vue'),
                props: true
            },
            {
                path: 'rutas-register/:id',
                name: 'rutas-register',
                component: () => import('../views/register/rutasRegister.vue'),
                props: true
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to) => {
    if (to.name === 'select-database') {
        return true
    }

    if (!getSelectedDbProfile()) {
        return { name: 'select-database', replace: true }
    }

    if (to.name === 'device-register') {
        return true
    }

    if (!getDeviceRegisteredStatus() && to.name !== 'select-database') {
        return { name: 'device-register', replace: true }
    }

    if (to.name === 'login') {
        return true
    }

    if (!getSessionUser()) {
        return { name: 'login', replace: true }
    }

    return true
})

export default router