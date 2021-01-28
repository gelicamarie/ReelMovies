import gel from 'clsx';
import { string, shape } from 'prop-types';

const FormItems = ({
  id, placeholder, type, formik,
}) => (
  <label htmlFor={id} key={id}>

    <span>{placeholder}</span>

    <div className="flex">

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
);

FormItems.propTypes = {
  id: string.isRequired,
  placeholder: string.isRequired,
  type: string.isRequired,
  formik: shape({}).isRequired,
};

export default FormItems;
