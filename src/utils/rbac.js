export const ROLES = {
    ADMIN: 'Admin',
    OWNER: 'Owner',
    DOCTOR: 'Dokter',
    CS: 'Customer Service',
    HRD: 'HRD',
    MANAGER: 'Manager',
    GUDANG_UMUM: 'Gudang Umum'
};

export const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: ['/', '/medical-records', '/patients', '/staff', '/sales', '/attendance', '/reports', '/settings', '/promos', '/management', '/products', '/treatments'],
    [ROLES.DOCTOR]: ['/', '/medical-records', '/patients', '/attendance', '/settings'],
    [ROLES.CS]: ['/', '/medical-records', '/patients', '/sales', '/attendance', '/settings'],
    [ROLES.HRD]: ['/', '/staff', '/attendance', '/settings'],
    [ROLES.MANAGER]: ['/', '/promos', '/attendance'],
    [ROLES.OWNER]: ['/', '/patients', '/staff', '/sales', '/reports', '/settings', '/attendance', '/promos', '/management', '/products', '/treatments'],
    [ROLES.GUDANG_UMUM]: ['/', '/products', '/treatments', '/attendance', '/settings', '/management'],
};

export const hasPermission = (userRole, path) => {
    if (!userRole || !path) return false; 
    
    const roleKey = Object.keys(ROLE_PERMISSIONS).find(key => 
        key.toLowerCase().trim() === userRole.toLowerCase().trim()
    );
    
    if (!roleKey) return false;
    
    const allowedPaths = ROLE_PERMISSIONS[roleKey];
    
    if (path === '/') return allowedPaths.includes('/');
    
    return allowedPaths.some(allowed => {
        if (allowed === '/') return false;
        // Cek path secara exact (persis)
        return path === allowed || path.startsWith(allowed + '/');
    });
};