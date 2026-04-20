export const ROLES = {
    SUPER_ADMIN: 'Super Admin',
    OWNER: 'Owner',
    KOMISARIS: 'Komisaris',
    DOCTOR: 'Dokter',
    CS: 'Customer Service',
    HRD: 'HRD',
    MANAGER: 'Manager',
    GUDANG_UMUM: 'Gudang Umum'
};

export const ROLE_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: ['*'], // Full access to everything
    [ROLES.DOCTOR]: ['/', '/medical-records', '/patients', '/attendance'],
    [ROLES.CS]: ['/', '/patients', '/sales', '/attendance', '/notifications', '/reservations', '/cs-products', '/cs-treatments'],
    [ROLES.HRD]: ['/', '/staff', '/attendance'],
    [ROLES.MANAGER]: ['/', '/promos', '/attendance'],
    [ROLES.OWNER]: ['/', '/patients', '/staff', '/reports', '/attendance', '/reservations'],
    [ROLES.KOMISARIS]: ['/', '/patients', '/staff', '/reports', '/attendance', '/reservations'],
    [ROLES.GUDANG_UMUM]: ['/', '/products', '/treatments', '/attendance', '/management'],
};

export const hasPermission = (userRole, path) => {
    if (!userRole || !path) return false;

    const roleKey = Object.keys(ROLE_PERMISSIONS).find(key =>
        key.toLowerCase().trim() === userRole.toLowerCase().trim()
    );

    if (!roleKey) return false;

    const allowedPaths = ROLE_PERMISSIONS[roleKey];

    // Super Admin has full access to everything
    if (allowedPaths.includes('*')) return true;

    if (path === '/') return allowedPaths.includes('/');

    return allowedPaths.some(allowed => {
        if (allowed === '/') return false;
        // Cek path secara exact (persis)
        return path === allowed || path.startsWith(allowed + '/');
    });
};