export default function ToastContainer({ toasts, remove }) {
  return <div className="toast-container">{toasts.map(t=>(
    <div key={t.id} className={`toast ${t.type}`}>
      <span>{t.type==='success'?'✓':t.type==='error'?'✕':'ℹ'}</span>
      <span>{t.msg}</span>
    </div>
  ))}</div>;
}