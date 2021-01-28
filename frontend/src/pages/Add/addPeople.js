import * as Yup from 'yup';
import { useFormik } from 'formik';
import gel from 'clsx';
import Layout from '../../components/Layout';
import FormSubmitBtn from '../../components/SubmitBtn';

const addFormOption = [
  { id: 'firstName', type: 'text', placeholder: 'First Name' },
  { id: 'lastName', type: 'text', placeholder: 'Last Name' },
];

const AddPeople = () => {
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
    },
    validationSchema: Yup.object().shape({
      firstName: Yup.string()
        .max(100, 'First name must be less than 100 characters')
        .required('First name is required'),
      lastName: Yup.string()
        .max(100, "Last name can't be longer than 100 characters")
        .required('Last name is required'),
    }),
    onSubmit: async (values) => {
      const response = await fetch('/people', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: `${values.firstName} ${values.lastName}` }),
      });

      if (response.status === 200) {
        window.location.assign('/filmcrew');
      } else {
        const { message } = await response.json();
        alert(`Something went wrong!!! ${message}`);
      }
    },
  });

  return (
    <Layout>
      <div className="py-4 pb-8 bg-theme-gelsBlue overflow-hidden sm:rounded-lg font-sans text-theme-bodyBg">
        <div className="flex items-baseline">
          <div className="border-2-b border-theme-gelsBlue sm:px-7 text-3xl font-bold text-theme-orange">Film Production</div>
          <h1 className="pr-4 pl-2">(adding new person)</h1>
        </div>
        <div className="flex flex-col pt-8 border-t-8 border-theme-bodyBg">
          <form onSubmit={formik.handleSubmit}>
            {addFormOption.map(({ id, type, placeholder }) => (
              <label htmlFor={id} key={id}>

                <div className="flex px-10">
                  <span>{placeholder}</span>

                  <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    {...formik.getFieldProps(id)}
                    className={gel(
                      'form-input my-2 block w-full rounded-lg text-black',
                      { 'border-theme-orange border-2': formik.errors[id] },
                    )}
                  />

                  {formik.touched[id] && formik.errors[id] ? (
                    <div className="w-6 text-theme-orange my-auto" style={{ marginLeft: '-35px' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  ) : null}

                </div>

                {formik.touched[id] && formik.errors[id] ? (
                  <div>
                    <p className="text-red-600 text-xs italic">{formik.errors[id]}</p>
                  </div>
                ) : null}

              </label>
            ))}
            <div className="float items-left">
              <FormSubmitBtn label="Add Person" />
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddPeople;
