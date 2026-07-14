import toast from 'react-hot-toast';

export const showToast = ({ message, type }) => {
    if (type === 'success') toast.success(message);
    else if (type === 'loading') toast.loading(message);
    else if (type === 'error') toast.error(message);
    else if( type === 'info') toast(message, { icon: 'ℹ️' });
    else if (type === 'warning') toast.warning(message);
    else if (type === 'custom') toast.custom(() => (
        <div className="custom-toast">
            {message}
        </div>
    ));
    else if (type === 'dark') toast.dark(message);
    else if (type === 'light') toast.light(message);
    else if(type === 'success-dark') toast.success(message, { className: 'bg-green-800 text-white' });
    else if(type === 'error-dark') toast.error(message, { className: 'bg-red-800 text-white' });
    else if(type === 'info-dark') toast(message, { icon: 'ℹ️', className: 'bg-blue-800 text-white' });
    else if(type === 'warning-dark') toast.warning(message, { className: 'bg-yellow-800 text-white' });
    else if(type === 'danger') toast.error(message, { className: 'bg-red-600 text-white' });
    else if (type === 'default') toast(message); // default case
    else toast.error(message); // default
}


export default showToast;