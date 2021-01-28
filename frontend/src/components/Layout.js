import { bool, node, string } from 'prop-types';

import Nav from './Sidebar';

const Layout = ({
  children, customClass, showLogin, showLogo,
}) => (
  <>
    <Nav showLogin={showLogin} showLogo={showLogo} />
    <main className={customClass || 'max-w-6xl mx-auto md:px-10 px-2 pt-2'}>
      {children}
    </main>
  </>
);

Layout.propTypes = {
  children: node.isRequired,
  customClass: string,
  showLogin: bool,
  showLogo: bool,
};

Layout.defaultProps = {
  customClass: undefined,
  showLogin: false,
  showLogo: true,
};

export default Layout;
