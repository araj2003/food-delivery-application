import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { userContext } from "../../../userContext/context";
import { useContext } from "react";
import classes from "./Login.module.css";
import Button from "../../Utils/Button/Button";
import axios from "axios";
import { loginUrl } from "../../../../urls/userUrl";
import { toast } from "react-hot-toast";
const Login = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        email: "",
        password: "",
    });
    const { setIsLogin } = useContext(userContext);
    const registerUser = async (e) => {
        e.preventDefault();
        const { email, password } = data;
        try {
            const response = await axios.post(loginUrl, {
                email,
                password,
            });

            const values = response.data;

            if (values.error) {
                toast.error(values.error, {
                    duration: 2000,
                });
                alert(values.error);
            } else {
                setData({});
                toast.success("Logged in", {
                    duration: 2000,
                });
                setIsLogin(true);
                if(values.role === 'owner'){
                    navigate("/admin");
                }
                else{
                    navigate("/homepage");
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <form onSubmit={registerUser} className={classes.formAction}>
            <h1 className="text-4xl">Login</h1>
            <div className={classes.input}>
                <input
                    className="p-2"
                    type="email"
                    placeholder="Enter email"
                    value={data.email}
                    onChange={(e) =>
                        setData({
                            ...data,
                            email: e.target.value,
                        })
                    }
                />
            </div>
            <div className={classes.input}>
                <input
                    className="p-2"
                    type="password"
                    placeholder="Enter password"
                    value={data.password}
                    onChange={(e) =>
                        setData({
                            ...data,
                            password: e.target.value,
                        })
                    }
                />
            </div>
            <Button type="submit" title={"Continue"} />
        </form>
    );
};
export default Login;
