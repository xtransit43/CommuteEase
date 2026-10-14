import React, { useEffect, useState } from 'react';
import { Slot, Link, usePathname } from 'expo-router';
import { View, Text, StyleSheet, useWindowDimensions, Pressable, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as SecureStore from 'expo-secure-store';

type NavItemProps = {
  href: "/" | "/about" | "/maps" | "/settings" | "/login";
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  isSidebar: boolean;
};

export default function WebLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; // Desktop Breakpoint
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        let userId = null;
        let storedUsername = null;

        if (Platform.OS === 'web') {
          userId = localStorage.getItem('userId');
          storedUsername = localStorage.getItem('username');
        } else {
          userId = await SecureStore.getItemAsync('userId');
          storedUsername = await SecureStore.getItemAsync('username');
        }

        setIsLoggedIn(!!userId);
        if (storedUsername) setUsername(storedUsername);
      } catch (err) {
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, [pathname]);

  return (
    <View style={[styles.root, isDesktop ? styles.rowLayout : styles.columnLayout]}>
      {/* Dynamic Responsive Navbar */}
      <View style={[styles.navbar, isDesktop ? styles.sidebar : styles.bottomTabs]}>
        {isDesktop && <Text style={styles.logo}>CommuteEase</Text>}

        <View style={isDesktop ? styles.sidebarLinks : styles.tabLinks}>
          <NavLink href="/" label="Home" icon="home" isSidebar={isDesktop} />
          <NavLink href="/about" label="About" icon="info" isSidebar={isDesktop} />
          <NavLink href="/maps" label="Maps" icon="map" isSidebar={isDesktop} />
          
          {/* Settings link rendered when logged in */}
          {isLoggedIn && (
            <NavLink href="/settings" label="Settings" icon="settings" isSidebar={isDesktop} />
          )}

          {/* Render Profile icon with Username when logged in, or Login link when logged out */}
          {isLoggedIn ? (
            <NavLink 
              href="/settings" 
              label={username || 'Profile'} 
              icon="account-circle" 
              isSidebar={isDesktop} 
            />
          ) : (
            <NavLink href="/login" label="Login" icon="login" isSidebar={isDesktop} />
          )}
        </View>
      </View>

      {/* Screen Views Injection Slot */}
      <View style={styles.contentContainer}>
        <Slot />
      </View>
    </View>
  );
}

function NavLink({ href, label, icon, isSidebar }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const activeColor = '#00ffff';
  const inactiveColor = '#ffffff';

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
          { color: isActive ? activeColor : inactiveColor, fontWeight: isActive ? 'bold' : 'normal' }
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
    backgroundColor: '#050505',
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
    backgroundColor: '#050505',
  },
  navbar: {
    backgroundColor: '#121212',
    borderStyle: 'solid',
    borderColor: '#ff00ff',
  },
  sidebar: {
    width: 240,
    height: '100vh',
    borderRightWidth: 2,
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  logo: {
    fontFamily: 'Comic Sans MS',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    paddingLeft: 12,
    color: '#ffffff',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  sidebarLinks: {
    flexDirection: 'column',
    gap: 12,
  },
  sidebarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeSidebarButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.12)',
    borderColor: '#00ffff',
  },
  sidebarLabel: {
    fontSize: 16,
    marginLeft: 14,
  },
  bottomTabs: {
    height: 65,
    borderTopWidth: 2,
    borderColor: '#ff00ff',
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
    fontFamily: 'Comic Sans MS',
  }
});