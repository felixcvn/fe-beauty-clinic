export const ROLES = {
    ADMIN: 'Admin',
    DOCTOR: 'Dokter',
    PHARMACIST: 'Apoteker',
    HRD: 'HRD',
    MANAGER: 'Manager'
};

export const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: [
        '/',
        '/medical-records',
        '/patients',
        '/staff',
        '/sales',
        '/sales/pos',
        '/attendance',
        '/reports',
        '/notifications',
        '/settings'
    ],
    [ROLES.DOCTOR]: [
        '/',
        '/medical-records',
        '/patients',
        '/attendance',
        '/notifications',
        '/settings'
    ],
    [ROLES.PHARMACIST]: [
        '/',
        '/medical-records',
        '/sales',
        '/sales/pos',
        '/attendance',
        '/notifications',
        '/settings'
    ],
    [ROLES.HRD]: [
        '/',
        '/staff',
        '/attendance',
        '/notifications',
        '/settings'
    ],
    [ROLES.MANAGER]: [
        '/',
        '/staff',
        '/sales',
        '/sales/pos',
        '/attendance',
        '/reports',
        '/notifications',
        '/settings'
    ]
};

export const hasPermission = (role, path) => {
    if (!role || !ROLE_PERMISSIONS[role]) return false;

    // Special case for root
    if (path === '/') return ROLE_PERMISSIONS[role].includes('/');

    return ROLE_PERMISSIONS[role].some(allowedPath => {
        if (allowedPath === '/') return false;
        // Match if exact match or if path is a sub-segment (e.g. /patients/new matches /patients)
        return path === allowedPath || path.startsWith(allowedPath + '/');
    });
};
