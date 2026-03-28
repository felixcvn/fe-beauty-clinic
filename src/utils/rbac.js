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
    [ROLES.ADMIN]: ['/', '/staff'],
    [ROLES.DOCTOR]: ['/', '/medical-records', '/patients', '/attendance'],
    [ROLES.CS]: ['/', '/medical-records', '/patients', '/sales', '/attendance'],
    [ROLES.HRD]: ['/', '/staff', '/attendance'],
    [ROLES.MANAGER]: ['/', '/promos', '/attendance'],
    [ROLES.OWNER]: ['/', '/patients', '/staff', '/reports', '/attendance'],
    [ROLES.GUDANG_UMUM]: ['/', '/products', '/treatments', '/attendance', '/management'],
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