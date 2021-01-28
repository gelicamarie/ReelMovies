import { Link } from '@reach/router';
import Layout from './Layout';

const NotAllowed = () => (
  <Layout>
    <div className="text-center mt-32">
      <h2 className="text-3xl">
        You are not allowed on this page
      </h2>
      <Link to="/">Go Back Home</Link>
    </div>
  </Layout>
);

export default NotAllowed;
