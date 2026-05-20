export function setSelectedOtm(data) {
    if (data) {
        sessionStorage.setItem('selectedOtm', JSON.stringify(data))
    }
}

export function getSelectedOtm() {
    const data = sessionStorage.getItem('selectedOtm')
    return data ? JSON.parse(data) : null
}

export function clearSelectedOtm() {
    sessionStorage.removeItem('selectedOtm')
}
