import { createContext, FC, useContext, useEffect, useState } from "react";

type Session = string | null;

const sessionKey = `mynote_session`;
const SessionState = createContext<[Session, (_: Session) => void]>([
  null,
  () => {},
]);

export const SessionProvider: FC = ({ children }) => {
  const sessionState = useState<Session>(null);
  useEffect(() => {
    const session = window.localStorage.getItem(sessionKey);
    if (session) sessionState[1](session);
  }, []);
  return (
    <SessionState.Provider value={sessionState}>
      {children}
    </SessionState.Provider>
  );
};
export const useSession = () => useContext(SessionState)[0];
export const useSessionSetter = () => {
  const [, setter] = useContext(SessionState);
  return (session: Session) => {
    setter(session);
    if (session) window.localStorage.setItem(sessionKey, session);
    else window.localStorage.removeItem(sessionKey);
  };
};