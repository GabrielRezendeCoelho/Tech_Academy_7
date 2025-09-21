import React, { createContext, useContext, useState } from 'react';
import AwesomeAlert from 'react-native-awesome-alerts';

const AlertContext = createContext({
  show: (msg: string) => {},
});

export function useAppAlert() {
  return useContext(AlertContext);
}

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  const show = (msg: string) => {
    setMessage(msg);
    setVisible(true);
  };

  return (
    <AlertContext.Provider value={{ show }}>
      {children}
      <AwesomeAlert
        show={visible}
        showProgress={false}
        title="Sucesso!"
        message={message}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor="#22c55e"
        onConfirmPressed={() => setVisible(false)}
      />
    </AlertContext.Provider>
  );
}

export default AlertProvider;
