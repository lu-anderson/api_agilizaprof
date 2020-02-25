## **Agiliza Prof API**

Api REST usando nodeJS com express.

- **URL**

  <www.agilizaon.com.br>

- **Methods:**

  `GET` | `POST` | `DELETE` | `PUT`

- **Classes**

  <url/classes>

* **Store classes**

> `POST` /classes/userId
> **Required:** > `userId=[String]`
>
> **Success Response:**
>
> - **Status Code:** 200 <br/>
> - **Content:**
>
> ```json
> {
>   "msg": "Success in add new Classes!"
> }
> ```
>
> **Error Response:**

- **Status Code:** 500 <br/>
  > - **Content:**
  >
  > ```json
  > {
  >   "msg": "Success in add new Classes!"
  > }
  > ```
  ```json
  {
    "msg": "Success in add new Classes!"
  }
  ```

* **Get all Classes**
  > `GET` /classes
  > Precisa do token de autenticação para realizar essa operação.

**Required:** > > **Success Response:** > _ **Status Code:** 200 <br/> > _ **Content:**

> ```json
>
>
>
> [
>   {
>       "students": [],
>       "diaries": [],
>       "diariesOfContents": [],
>       "learningObjectives": [],
>       "needUpdate": false,
>       "existDataForSaveInRealm": true,
>       "exitsDataForSaveInSigEduca": true,
>       "evaluatedUser": false,
>       "evaluatedInSigEduca": false,
>       "\_id": "5e4c95e273a60e17dcc0781a",
>       "school": "NILCE",
>       "discipline": "MATEMÁTICA",
>       "classe": "A",
>       "codeSeries": 2,
>       "codeId": "01",
>       "segment": "ensino fundamental",
>       "displayText": "MATEMÁTICA | 6º ANO A | ESCOLA NILCE",
>       "\_user": "5e4b089ff4d6951a4825b9b5",
>       "\_\_v": 22
>   },
>   {
>       "Others Classes" : {}
>    }
> ```
