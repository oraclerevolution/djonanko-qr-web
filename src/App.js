import { useState, useEffect } from 'react';
import './App.css';
import 'tailwindcss/tailwind.css';
import logo from './djonanko-logo.png'
import om from './om.png'
import wave from './wave.jpeg'
import moov from './moov.png'
import mtn from './mtn.png'
import queryString from 'query-string';
import axios from 'axios';

function App() {
  const [amount, setAmount] = useState('');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [sourceOperator, setSourceOperator] = useState('');
  const [recipientOperator, setRecipientOperator] = useState('');
  const [message, setMessage] = useState('');
  const [receiverNumber, setReceiverNumber] = useState('');
  const [adminToken, setAdminToken] = useState('')
  const [adminNumber, setAdminNumber] = useState('0709483463');
  const [adminPassword, setAdminPassword] = useState('1234');
  const [receiverInfos, setReceiverInfos] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique pour traiter le paiement ici
    setMessage(`Paiement de ${amount}€ à ${recipientNumber} effectué avec succès!`);
  };


  const login = async (numero, password) => {
    if (numero === "" || password === "") {
      console.log("Veuillez remplir tous les champs")
    } else {
      await axios
        .post("https://djonanko-service.onrender.com/user/login", {
          numero,
          password
        })
        .then(async (res) => {
          console.log('res', res.data.access_token)
          setAdminToken(res.data.access_token)
          await getUserInfos(res.data.access_token)
          return res.data
        })
        .catch((err) => {
          console.log("err", err.response.data);
          console.log('status', err.response.data.status)
          if (err.response.data.statusCode === 404 || err.response.data.statusCode === 400) {
            console.log('status', err.response.data.message)
          }
          console.log("erreur", err)
        });
    }
  }

  const displayRecipientOperatorNumber = (operator) => {
    switch (operator) {
      case 'Orange':
        return <p>{receiverInfos.orangeMoney === null ? `Le numero ${recipientOperator} money n'a pas été configuré` : `+225 ${receiverInfos.orangeMoney}`}</p>
      case 'Moov':
        return <p>{receiverInfos.moovMoney === null ? `Le numero ${recipientOperator} money n'a pas été configuré` : `+225 ${receiverInfos.moovMoney}`}</p>
      case 'Wave':
        return <p>{receiverInfos.waveMoney === null ? `Le numero ${recipientOperator} money n'a pas été configuré` : `+225 ${receiverInfos.waveMoney}`}</p>
      case 'MTN':
        return <p>{receiverInfos.mtnMoney === null ? `Le numero ${recipientOperator} money n'a pas été configuré` : `+225 ${receiverInfos.mtnMoney}`}</p>
      default:
        return <p></p>
    }
  }


  const getUserInfos = async (token) => {
    console.log('token', token);
    console.log('receiverNumber', receiverNumber);
    await axios.get(`https://djonanko-service.onrender.com/user/user-infos-by-number`, {
      headers: {
        'authenticationtoken': token
      },
      params: {
        phoneNumber: receiverNumber
      }
    }).then((res) => {
      console.log('res', res.data);
      setReceiverInfos(res.data)
      // res.data.moovMoney !== null ? setMoovNumber(res.data.moovMoney) : setMoovNumber("")
      // res.data.orangeMoney !== null ? setOrangeNumber(res.data.orangeMoney) : setOrangeNumber("")
      // res.data.waveMoney !== null ? setWaveNumber(res.data.waveMoney) : setWaveNumber("")
      // res.data.mtnMoney !== null ? setMtnNumber(res.data.mtnMoney) : setMtnNumber("")
    }).catch((err) => {
      console.log("error", err.response.data)
    })
  }

  const disabledButton = () => {
    if(adminToken === '' || sourceOperator === '' || recipientNumber === '' || recipientNumber.length < 10 || amount === '' || parseInt(amount) < 500) {
      return true
    } else {
      return false
    }
  }

  useEffect(() => {
    const params = queryString.parse(window.location.search);
    setReceiverNumber(params.numero);
    login(adminNumber, adminPassword);
  }, [adminNumber, adminPassword]);

  return (
    <div className="min-h-screen flex flex-col">
      <section className="flex flex-col items-center justify-center flex-grow hero">
        <div className="flex flex-col md:flex-row items-center justify-center max-w-4xl mx-auto p-4">
          <img src={logo} alt="Djonanko" className="w-full md:w-1/2 rounded-lg shadow-lg" style={{ maxWidth: '150px' }} />
          <div className="text-center md:text-left md:ml-8 mt-4 md:mt-0">
            <h1 className="text-2xl font-bold mb-4 title">Envoyez de l'argent dès maintenant avec Djonanko</h1>
          </div>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className='border max-w-md mx-auto p-4 rounded-lg senderInfos flex flex-col justify-center items-center'>
          {receiverInfos.fullname === undefined ? (
            <p>Chargement</p>
          ) : (
            <>
              <p>{receiverInfos.fullname}</p>
              {recipientOperator === '' ? (
                <p></p>
              ):(
                displayRecipientOperatorNumber(recipientOperator)
              )}
            </>
          )}
        </div>
        <div className="max-w-md mx-auto p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">De quel opérateur vous envoyez de l'argent ?</label>
              <div className="flex space-x-4">
                <label className="flex items-center text-xs">
                  <input
                    type="radio"
                    value="Orange"
                    checked={sourceOperator === 'Orange'}
                    onChange={(e) => setSourceOperator(e.target.value)}
                    className="mr-2"
                  />
                  <img src={om} alt='logo OM' className='rounded-md shadow-lg' style={{ maxWidth: '20px' }} />
                  Orange
                </label>
                <label className="flex items-center text-xs">
                  <input
                    type="radio"
                    value="Wave"
                    checked={sourceOperator === 'Wave'}
                    onChange={(e) => setSourceOperator(e.target.value)}
                    className="mr-2"
                  />
                  <img src={wave} alt='logo Wave' className='rounded-md shadow-lg' style={{ maxWidth: '20px' }} />
                  Wave
                </label>
                <label className="flex items-center text-xs">
                  <input
                    type="radio"
                    value="Moov"
                    checked={sourceOperator === 'Moov'}
                    onChange={(e) => setSourceOperator(e.target.value)}
                    className="mr-2"
                  />
                  <img src={moov} alt='logo Moov' className='rounded-md shadow-lg' style={{ maxWidth: '20px' }} />
                  Moov
                </label>

                <label className="flex items-center text-xs">
                  <input
                    type="radio"
                    value="MTN"
                    checked={sourceOperator === 'MTN'}
                    onChange={(e) => setSourceOperator(e.target.value)}
                    className="mr-2"
                  />
                  <img src={mtn} alt='logo MTN' className='rounded-md shadow-lg' style={{ maxWidth: '20px' }} />
                  MTN
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Vers quel opérateur vous envoyez de l'argent ?</label>
              <div className="flex space-x-4">
                <label className="flex items-center text-xs">
                  <input
                    type="radio"
                    value="Orange"
                    checked={recipientOperator === 'Orange'}
                    onChange={(e) => setRecipientOperator(e.target.value)}
                    className="mr-2"
                  />
                  <img src={om} alt='logo OM' className='rounded-md shadow-lg' style={{ maxWidth: '20px' }} />
                  Orange
                </label>
                <label className="flex items-center text-xs">
                  <input
                    type="radio"
                    value="Wave"
                    checked={recipientOperator === 'Wave'}
                    onChange={(e) => setRecipientOperator(e.target.value)}
                    className="mr-2"
                  />
                  <img src={wave} alt='logo Wave' className='rounded-md shadow-lg' style={{ maxWidth: '20px' }} />
                  Wave
                </label>
                <label className="flex items-center text-xs">
                  <input
                    type="radio"
                    value="Moov"
                    checked={recipientOperator === 'Moov'}
                    onChange={(e) => setRecipientOperator(e.target.value)}
                    className="mr-2"
                  />
                  <img src={moov} alt='logo Moov' className='rounded-md shadow-lg' style={{ maxWidth: '20px' }} />
                  Moov
                </label>
                <label className="flex items-center text-xs">
                  <input
                    type="radio"
                    value="MTN"
                    checked={recipientOperator === 'MTN'}
                    onChange={(e) => setRecipientOperator(e.target.value)}
                    className="mr-2"
                  />
                  <img src={mtn} alt='logo MTN' className='rounded-md shadow-lg' style={{ maxWidth: '20px' }} />
                  MTN
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Saisissez votre numero</label>
              <input
                type="text"
                max={10}
                value={recipientNumber}
                onChange={(e) => setRecipientNumber(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-0">Montant</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            {parseInt(amount) < 500 && <p className='text-red-500 mb-2'>Entrez un montant supérieur ou égale à 500 FCFA</p>}

            <button
              type="submit"
              className="w-full text-white py-2 rounded-lg transition duration-300 button"
              disabled={disabledButton()}
              style={{backgroundColor: disabledButton() ? '#efefef' : '#0b4530', color: disabledButton() ? '#000' : '#fff' }}
            >
              Effectuer le paiement
            </button>
          </form>
          {message && <p className="mt-4 text-green-600">{message}</p>}
        </div>
      </section>

      <footer className="bg-gray-200 text-center py-4">
        <p>Djonanko CI - Tous droits réservés 2024</p>
      </footer>
    </div>
  );
}

export default App;
