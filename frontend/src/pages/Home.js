import Layout from '../components/Layout';
import SearchBar from '../components/Searchbar';

const Home = () => (
  <Layout showLogo={false} showLogin customClass="flex h-screen items-center justify-center -mt-32">
    <div className="-mt-64 pt-32 flex flex-col items-center justify-center w-full md:w-3/4 lg:w-2/4">
      <img src="/homepage.png" alt="Logo" className="h-64 -mt-32 -mb-10 pb-10" />
      <SearchBar />
    </div>
  </Layout>
);

export default Home;
