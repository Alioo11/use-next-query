import React from 'react';

const useTest = () => {
  React.useEffect(() => {
    console.log('test');
  }, []);
};

export default useTest;
