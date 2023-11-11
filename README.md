## use-next-query

### Install

    npm install use-next-query 

    or  

    yarn add use-next-query




### Features
- integration with `yup` to provide structured maintenance for query params 
- watch changes for a specific key in the in query params 


### Quickstart

```jsx

import { useNextQuery } from 'use-next-query';
import * as yup from 'yup';

const exampleSchema = yup.object().shape({
    name: yup.string(),
    age: yup.number()
})

function App() {
    const {update} = useNextQuery(exampleSchema , {initialState: {name:"your-name" , age:10}})

    return (
        <div>
           <button onClick={() => update("name" , "some-other-name")} >click to see query update</button>
        </div>
    )
}
```


### Interface 

#### watch: 

takes a list of keys from provided schema and calls the callback with updated state whenever one of the keys change 

provide an empty array to watch for every key change 

* warning : make to not update query params in the callback as it possibly creates a render loop 

```jsx
    watch(["example-key"] , (updatedState) =>{
        // do something in the callback with the latest state 
    })
```


#### update: 

takes a `key` and a `value` and updates the query params accordingly 

```js
    update("example-key" , "new-value")
```
- note : `update` function won't update the query params immediately and waits a few  milliseconds for additional updates
- example 

```js
    update("example-key", "new-value");
    update("example-key", "some-other-value");
    update("some-other-key", "new-value");
    update("some-other-key", "some-other-value");
```

this will update the query params only once 


#### deleteKey: 

takes a `key` and removes it from query params 

```js
    deleteKey("example-key")
```

#### state: 

the latest state of query params 
