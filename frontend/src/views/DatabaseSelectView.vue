<script setup>
import logo from '../assets/manager_logo.png'
import logo_emp from '../assets/hazlo_software.png'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import UiAlert from '../components/UiAlert.vue'
import { DB_PROFILES, setSelectedDbProfile } from '../utils/dbProfile.js'

// Importación directa de los componentes de la librería
import { Factory, Building2, Gauge, Database, ArrowRight } from 'lucide-vue-next'

const router = useRouter()
const alertVisible = ref(false)
const alertMessage = ref('')

function selectProfile(profile) {
    if (!profile.available) {
        alertMessage.value = 'Esta base de datos aún no está disponible.'
        alertVisible.value = true
        return
    }

    try {
        setSelectedDbProfile(profile.id)
        router.push({ name: 'device-register' })
    } catch (error) {
        alertMessage.value = error.message || 'No se pudo seleccionar la base de datos.'
        alertVisible.value = true
    }
}
</script>

<template>
    <div class="container-login min-h-screen">
        <!-- Decoración industrial de planos técnicos no intrusiva (Pointer-events deshabilitado en esquina superior derecha) -->
        <div class="industrial-bg">
            <svg class="gear gear-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
        </div>

        <div class="content-wrapper">
            <header class="header-logo">
                <img :src="logo" alt="Manager Logo" class="img-logo">
            </header>

            <section class="glass-panel">
                <div class="accent-bar"></div>
                <h1>Seleccione el Entorno de Trabajo</h1>

                <Transition name="fade-slide">
                    <UiAlert
                        v-if="alertVisible"
                        type="warning"
                        :message="alertMessage"
                        @close="alertVisible = false"
                    />
                </Transition>

                <div class="profile-list">
                    <button
                        v-for="profile in DB_PROFILES"
                        :key="profile.id"
                        type="button"
                        class="profile-card"
                        :class="[
                            'profile-card--' + profile.id,
                            { 'profile-card--disabled': !profile.available }
                        ]"
                        :disabled="!profile.available"
                        @click="selectProfile(profile)"
                    >
                        <div class="profile-card__content-wrapper">
                            <div :class="['profile-card__icon-container', 'profile-card__icon-container--' + profile.id]">
                                <Factory v-if="profile.id === 'db1'" class="profile-card__icon" />
                                <Building2 v-else-if="profile.id === 'db2'" class="profile-card__icon" />
                                <Gauge v-else-if="profile.id === 'db3'" class="profile-card__icon" />
                                <Database v-else class="profile-card__icon" />
                            </div>

                            <div class="profile-card__text-group">
                                <div class="profile-card__header">
                                    <span class="profile-card__title">{{ profile.description }}</span>
                                    <span v-if="!profile.available" class="profile-card__badge">Próximamente</span>
                                </div>
                                <p class="profile-card__subtitle">{{ profile.label }}</p>
                            </div>

                            <div class="profile-card__arrow-container">
                                <ArrowRight class="profile-card__arrow-icon" />
                            </div>
                        </div>
                    </button>
                </div>
            </section>

            <footer class="footer-grid">
                
                <div class="footer-grid__col footer-grid__col--center">
                    <span class="powered-by">Realizado por</span>
                    <img :src="logo_emp" alt="Hazlo Software" class="img-logo-emp">
                </div>

            </footer>
        </div>
    </div>
</template>

<style scoped>
.container-login {
    min-height: 100vh;
    /* Fondo degradado azul corporativo enriquecido por un destello de luz central superior */
    background: 
        radial-gradient(circle at top center, rgba(255, 255, 255, 0.12), transparent 45%),
        linear-gradient(180deg, #163766 0%, #0f2b54 50%, #0a1f3f 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

/* Rejilla técnica de fondo estilo plano industrial */
.container-login::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: 
        radial-gradient(rgba(255, 255, 255, 0.10) 1px, transparent 1px),
        linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
    background-size: 40px 40px, 20px 20px, 20px 20px;
    background-position: center;
    opacity: 0.4;
}

/* Contonéo técnico decorativo desplazado por completo arriba a la derecha */
.industrial-bg {
    position: absolute;
    top: 0;
    right: 0;
    width: 320px;
    height: 320px;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
    opacity: 0.08;
}

.gear {
    position: absolute;
    color: #ffffff;
    transform-origin: center;
}

.gear-1 {
    width: 380px;
    height: 380px;
    top: -80px;
    right: -80px;
    animation: spin 60s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.content-wrapper {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; /*space-between*/
    min-height: 100vh;
    width: 100%;
    padding: 3rem 1.5rem;
}

.header-logo {
    width: 100%;
    max-width: 650px;
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
}

.img-logo {
    width: 100%;
    height: auto;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.35));
}

/* Panel central de fondo rico oscuro (Estilo Fiori Overlay) */
.glass-panel {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-radius: 28px;
    padding: 2.5rem 2rem;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.10);
    width: 85%;
    max-width: 720px;
    margin: auto 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.accent-bar {
    width: 140px;
    height: 6px;
    border-radius: 999px;
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    margin-bottom: 1.5rem;
}

h1 {
    font-size: 1.4rem;
    font-weight: 800;
    color: #000000;
    margin-bottom: 1rem;
    text-align: center;
    letter-spacing: -0.02em;
    line-height: 1.2;
}

.subtitle {
    text-align: center;
    color: #cbd5e1;
    margin-bottom: 2.5rem;
    line-height: 1.5;
    font-size: 1.1rem;
    text-wrap: balance;
}

.profile-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
}

/* Tarjetas claras de base de datos con tipografía oscura ultra legible */
.profile-card {
    width: 100%;
    text-align: left;
    background: rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 18px;
    padding: 0.8rem 1rem;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.18);
    position: relative;
    overflow: hidden;
}

/* Línea sutil de acento en el borde izquierdo para indicar contexto de módulo */
.profile-card--db1 {
    border-left: 5px solid #ef4444 !important;
}

.profile-card--db2 {
    border-left: 5px solid #3b82f6 !important;
}

.profile-card--db3 {
    border-left: 5px solid #22c55e !important;
}

/* Colores temáticos aplicados a los títulos de las tarjetas */
.profile-card--db1 .profile-card__title {
    color: #ef4444; /* Rojo para Normandy Planta */
}

.profile-card--db2 .profile-card__title {
    color: #3b82f6; /* Azul para Normandy Locativos */
}

.profile-card--db3 .profile-card__title {
    color: #22c55e; /* Verde para Normandy Metrología */
}

.profile-card__content-wrapper {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    height: 100%;
}

/* Contenedor circular esférico claro de alto contraste para iconos (72x72) */
.profile-card__icon-container {
    width: 72px;
    height: 72px;
    min-width: 72px;
    min-height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.85);
    transition: all 0.3s ease;
}

.profile-card__icon {
    width: 38px;
    height: 38px;
}

/* Colores semánticos de íconos */
.profile-card__icon-container--db1 {
    color: #ef4444;
}

.profile-card__icon-container--db2 {
    color: #3b82f6;
}

.profile-card__icon-container--db3 {
    color: #22c55e;
}

.profile-card__text-group {
    flex: 1;
}

/* Transición Interactiva y Hover Suave */
.profile-card:hover:not(:disabled) {
    transform: translateY(-4px);
    background-color: rgba(255, 255, 255, 0.25);
    box-shadow: 0 16px 35px rgba(0, 0, 0, 0.25);
    border-color: rgba(255, 255, 255, 0.35);
}

.profile-card:hover.profile-card--db1:not(:disabled) {
    box-shadow: 0 16px 35px rgba(0, 0, 0, 0.22), 0 0 25px rgba(239, 68, 68, 0.20);
}
.profile-card:hover.profile-card--db1:not(:disabled) .profile-card__icon-container {
    background-color: rgba(255, 255, 255, 0.85);
    transform: scale(1.05);
}

.profile-card:hover.profile-card--db2:not(:disabled) {
    box-shadow: 0 16px 35px rgba(0, 0, 0, 0.22), 0 0 25px rgba(59, 130, 246, 0.20);
}
.profile-card:hover.profile-card--db2:not(:disabled) .profile-card__icon-container {
    background-color: rgba(255, 255, 255, 0.85);
    transform: scale(1.05);
}

.profile-card:hover.profile-card--db3:not(:disabled) {
    box-shadow: 0 16px 35px rgba(0, 0, 0, 0.22), 0 0 25px rgba(34, 197, 94, 0.20);
}
.profile-card:hover.profile-card--db3:not(:disabled) .profile-card__icon-container {
    background-color: rgba(255, 255, 255, 0.85);
    transform: scale(1.05);
}

/* Desplazamiento de flecha al pasar por encima */
.profile-card:hover:not(:disabled) .profile-card__arrow-container {
    transform: translateX(4px);
    background-color: rgba(0, 0, 0, 0.05);
}

/* Estado Deshabilitado */
.profile-card--disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background-color: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(255, 255, 255, 0.08) !important;
    border-left-color: rgba(255, 255, 255, 0.15) !important;
    box-shadow: none !important;
}
.profile-card--disabled .profile-card__title {
    color: #1e293b !important;
    opacity: 0.6;
}
.profile-card--disabled .profile-card__subtitle {
    color: #475569 !important;
    opacity: 0.5;
}
.profile-card--disabled .profile-card__icon-container {
    background-color: rgba(255, 255, 255, 0.3) !important;
    color: #475569 !important;
}

.profile-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
}

/* Tipografías oscuras para legibilidad superior */
.profile-card__title {
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a; /* Slate oscuro */
    transition: color 0.15s ease;
}

.profile-card__subtitle {
    margin: 0 0 0 0;
    color: #64748b;  /* Slate medio */
    font-size: 0.85rem;
    font-weight: 500;
}

.profile-card__badge {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #b45309;
    background: #fef3c7;
    padding: 2px 8px;
    border-radius: 4px;
}

/* Personalización del contenedor de flecha derecha */
.profile-card__arrow-container {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #0f172a;
    background-color: transparent;
    transition: all 0.20s ease;
}

.profile-card__arrow-icon {
    width: 24px;
    height: 24px;
}

/* Grid del Footer en Tres Columnas */
.footer-grid {
    width: 100%;
    max-width: 900px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-top: auto;
    padding-top: 5.5rem;
    color: rgba(255, 255, 255, 0.70);
    font-size: 0.85rem;
}

.footer-grid__col {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.footer-grid__label {
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    color: rgba(255, 255, 255, 0.45);
}

.footer-grid__value {
    font-weight: 500;
    margin-top: 2px;
}

.footer-grid__link {
    color: #38bdf8;
    text-decoration: none;
    transition: color 0.15s ease;
}

.footer-grid__link:hover {
    color: #7dd3fc;
}

.powered-by {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(255, 255, 255, 0.45);
    margin-bottom: 4px;
}

.img-logo-emp {
    max-width: 650px;
    width: 80%;
    height: auto;
    opacity: 0.85;
    margin-top: -14px; /* <--- Esto elevará el logo reduciendo el espacio con el texto */
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.3s ease-out;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

/* Media Queries optimizadas para Tablet Android de 11 pulgadas orientada verticalmente (min-width: 800px) */
@media (min-width: 800px) {
    .content-wrapper {
        max-width: 900px;
        padding: 4rem 2rem;
    }

    .header-logo {
        max-width: 650px;
        margin-bottom: 2.5rem;
    }

    .glass-panel {
        max-width: 720px;
        padding: 3rem 2.5rem;
    }

    h1 {
        font-size: 2.30rem;
    }

    .subtitle {
        font-size: 1.1rem;
    }

    .footer-grid {
        grid-template-columns: 1fr auto 1fr;
        gap: 2rem;
    }

    .footer-grid__col--left {
        align-items: flex-start;
        text-align: left;
    }

    .footer-grid__col--right {
        align-items: flex-end;
        text-align: right;
    }
}

/* Soporte responsivo de ordenamiento para móviles */
@media (max-width: 799px) {
    .footer-grid {
        gap: 1.25rem;
    }

    .footer-grid__col--center {
        order: -1; 
        margin-bottom: 0.5rem;
    }
}
</style>