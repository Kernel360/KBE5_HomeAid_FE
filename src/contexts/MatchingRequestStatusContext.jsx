import React, { createContext, useContext, useState } from 'react';

const MatchingRequestStatusContext = createContext();

export const MatchingRequestStatusProvider = ({ children }) => {
  const [requestAccepted, setRequestAccepted] = useState(false);
  const [isActionCompleted, setIsActionCompleted] = useState(false);

  return (
    <MatchingRequestStatusContext.Provider
      value={{
        requestAccepted,
        setRequestAccepted,
        isActionCompleted,
        setIsActionCompleted,
      }}
    >
      {children}
    </MatchingRequestStatusContext.Provider>
  );
};

export const useMatchingRequestStatus = () => {
  const context = useContext(MatchingRequestStatusContext);
  if (!context) {
    throw new Error(
      'useMatchingRequestStatus must be used within a MatchingRequestStatusProvider'
    );
  }
  return context;
};
