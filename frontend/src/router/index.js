import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../views/LoginView.vue'
import PersonalInfoView from '../views/PersonalInfoView.vue'
import PrincipalView from '../views/PrincipalView.vue'
import { getSessionUser } from '../utils/authSession.js'

const routes = [
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
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to) => {
    if (to.name === 'login') {
        return true
    }
    if (!getSessionUser()) {
        return { name: 'login', replace: true }
    }
    return true
})

export default router