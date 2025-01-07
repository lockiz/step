import {Navigate} from "react-router-dom";
import {notification} from "antd";
import {useAuth} from "./pages/context/AuthContext";

const ProtectedRoute = ({children, roles}) => {
    const {user, loading} = useContext(AuthContext);

    if (loading) {
        return <div>Загрузка...</div>; // Показываем индикатор загрузки
    }

    if (!user) {
        return <Navigate to="/login" replace/>;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace/>;
    }

    return children;
};


export default ProtectedRoute;
