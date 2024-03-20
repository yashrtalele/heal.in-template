import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);

    useEffect(() => {
        const loadToken = async () => {
            const token = await AsyncStorage.getItem("token");
            console.log(typeof token);
            setIsAuthenticated(!!token); // Set isAuthenticated to true if token exists, false otherwise
            if (token) {
                axios.defaults.headers.common[
                    "Authorization"
                ] = `Bearer ${token}`;

                try {
                    const profileResponse = await axios.get(
                        "http://localhost:8082/api/user/getProfile"
                    );
                    if (profileResponse.status === 200) {
                        console.log(profileResponse.data);
                        const data = profileResponse.data;
                        const strAge = String(data.age);
                        const strcontact = String(data.contact);
                        await AsyncStorage.setItem("firstName", data.firstName);
                        await AsyncStorage.setItem("age", strAge);
                        await AsyncStorage.setItem("lastName", data.lastName);
                        await AsyncStorage.setItem("email", data.email);
                        await AsyncStorage.setItem("gender", data.gender);
                        await AsyncStorage.setItem("role", data.role);
                        await AsyncStorage.setItem("contact", strcontact);
                    }
                } catch {
                    await AsyncStorage.removeItem("token");
                    await AsyncStorage.removeItem("firstName");
                    await AsyncStorage.removeItem("age");
                    await AsyncStorage.removeItem("lastName");
                    await AsyncStorage.removeItem("email");
                    await AsyncStorage.removeItem("gender");
                    await AsyncStorage.removeItem("role");
                    await AsyncStorage.removeItem("contact");
                    axios.defaults.headers.common["Authorization"] = "";
                    setIsAuthenticated(false);
                }
            }
        };
        loadToken();
    }, [isAuthenticated]);

    const login = async (email, password) => {
        try {
            const response = await axios.post(
                "http://localhost:8082/api/user/login",
                {
                    email: email,
                    password: password,
                }
            );

            if (response.status === 200) {
                const token = response.data;
                await AsyncStorage.setItem("token", token);
                axios.defaults.headers.common[
                    "Authorization"
                ] = `Bearer ${token}`;
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.log("Error logging in: ", error);
            setIsAuthenticated(false);
        }
    };

    const register = async (username, password, email) => {
        try {
        } catch (error) {}
    };
    const logout = async () => {
        try {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("firstName");
            await AsyncStorage.removeItem("age");
            await AsyncStorage.removeItem("lastName");
            await AsyncStorage.removeItem("email");
            await AsyncStorage.removeItem("gender");
            await AsyncStorage.removeItem("role");
            await AsyncStorage.removeItem("contact");
            axios.defaults.headers.common["Authorization"] = "";
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Error logging out: ", error);
        }
    };
    return (
        <AuthContext.Provider
            value={{ user, isAuthenticated, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const value = useContext(AuthContext);
    const { isAuthenticated } = value;
    console.log(isAuthenticated + " test");
    if (!value) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return value;
};
