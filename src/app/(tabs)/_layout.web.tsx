import { Slot, Link, usePathname } from 'expo-router';
import { View, Text, StyleSheet, useWindowDimensions, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type NavItemProps = {
  href: "/" | "/about" | "/maps";
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  isSidebar: boolean;
};

export default function WebLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; // Desktop Breakpoint

  return (
    <View style={[styles.root, isDesktop ? styles.rowLayout : styles.columnLayout]}>
      {/* Dynamic Responsive Navbar */}
      <View style={[styles.navbar, isDesktop ? styles.sidebar : styles.bottomTabs]}>
        {isDesktop && <Text style={styles.logo}>CommuteEase</Text>}

        <View style={isDesktop ? styles.sidebarLinks : styles.tabLinks}>
          <NavLink href="/" label="Home" icon="home" isSidebar={isDesktop} />
          <NavLink href="/about" label="About" icon="info" isSidebar={isDesktop} />
          <NavLink href="/maps" label="Maps" icon="map" isSidebar={isDesktop} />

        </View>
      </View>

      {/* Screen Views Injection Slot */}
      <View style={styles.contentContainer}>
        <Slot />
      </View>
    </View>
  );
}

// Update the NavLink component inside app/(tabs)/_layout.web.tsx
function NavLink({ href, label, icon, isSidebar }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const activeColor = '#007AFF';
  const inactiveColor = '#666';

  return (
    <Link href={href} asChild>
      <Pressable 
        style={StyleSheet.flatten([
          styles.linkButton,
          isSidebar ? styles.sidebarButton : styles.tabButton,
          isSidebar && isActive && styles.activeSidebarButton
        ])}
      >
        <MaterialIcons 
          name={icon} 
          size={isSidebar ? 24 : 22} 
          color={isActive ? activeColor : inactiveColor} 
        />
        <Text style={[
          styles.labelText, 
          isSidebar ? styles.sidebarLabel : styles.tabLabel,
          { color: isActive ? activeColor : inactiveColor, fontWeight: isActive ? '600' : '400' }
        ]}>
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}


const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  rowLayout: {
    flexDirection: 'row',
  },
  columnLayout: {
    flexDirection: 'column-reverse', 
  },
  contentContainer: {
    flex: 1,
    height: '100%',
  },
  navbar: {
    backgroundColor: '#ffffff',
    borderStyle: 'solid',
    borderColor: '#eaeaea',
  },
  sidebar: {
    width: 240,
    height: '100vh',
    borderRightWidth: 1,
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  logo: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 32,
    paddingLeft: 12,
    color: '#111',
  },
  sidebarLinks: {
    flexDirection: 'column',
    gap: 8,
  },
  sidebarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: '100%',
  },
  activeSidebarButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
  },
  sidebarLabel: {
    fontSize: 16,
    marginLeft: 16,
  },
  bottomTabs: {
    height: 65,
    borderTopWidth: 1,
    justifyContent: 'center',
  },
  tabLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  linkButton: {
    cursor: 'pointer',
  },
  labelText: {
    fontFamily: 'System',
  }
});
