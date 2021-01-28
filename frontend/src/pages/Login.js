import { useContext } from 'react';
import { useFormik } from 'formik';
import { Link } from '@reach/router';
import * as Yup from 'yup';
import gel from 'clsx';
import Layout from '../components/Layout';
import FormInput from '../components/FormInput';
import FormSubmitBtn from '../components/SubmitBtn';
import { AuthContext, AUTH_ACTIONS } from '../lib/auth';

const contactFormOptions = [
  { id: 'username', type: 'text', placeholder: 'Username' },
  { id: 'password', type: 'password', placeholder: 'Password' },
];

const Login = () => {
  const { dispatch } = useContext(AuthContext);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object().shape({
      username: Yup.string()
        .min(5, 'Username must have at least 5 characters')
        .max(100, 'Username must be less than 100 characters')
        .required('Username is required'),
      password: Yup.string()
        .min(10, 'Password must have at least 10 characters')
        .max(100, "Password can't be longer than 100 characters")
        .required('Password is required'),
    }),
    onSubmit: async (values) => {
      const response = await (await fetch('/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      })).json();

      if (!response.error) {
        const { _id: id } = response;
        dispatch({ type: AUTH_ACTIONS.login });
        window.location.assign(`/users/${id}`);
      } else {
        alert(response.message);
      }
    },
  });

  return (
    <Layout>

      <div className="md:flex md:items-center md:flex-row md:pt-20 pt-6">

        <form
          style={{ boxShadow: '2px 2px 15px 5px rgba(147,58,22,1)' }}
          className={gel(
            'font-medium text-xl',
            'sm:w-3/4 mt-5 p-4 mx-auto',
            'rounded-lg',
          )}
          onSubmit={formik.handleSubmit}
        >

          <img src="/homepage.png" alt="Logo" className="flex mx-auto" />

          {contactFormOptions.map((props) => (
            <FormInput id={props.id} formik={formik} {...props} />
          ))}

          <div className="flex items-center justify-between">
            <Link to="/signup" className="pl-2 text-theme-orange hover:text-theme-gelsWhite">Create Account</Link>
            <FormSubmitBtn label="Login" />
          </div>

        </form>

      </div>

    </Layout>
  );
};

export default Login;
