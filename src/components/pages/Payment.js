import { useState, useEffect } from 'react';
import '../../App.css';
import 'tailwindcss/tailwind.css';
import logo from '../../djonanko-logo.png'
import om from '../../om.png'
import wave from '../../wave.jpeg'
import moov from '../../moov.png'
import mtn from '../../mtn.png'
import queryString from 'query-string';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { InfinitySpin } from 'react-loader-spinner';

function useQuery() { return new URLSearchParams(useLocation().search); }

const Payment = () => {
  const [amount, setAmount] = useState('');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [sourceOperator, setSourceOperator] = useState('');
  const [recipientOperator, setRecipientOperator] = useState('');
  const [message, setMessage] = useState('');
  const [receiverNumber, setReceiverNumber] = useState('');
  const [adminToken, setAdminToken] = useState('')
  const [receiverInfos, setReceiverInfos] = useState({});
  const [loading, setLoading] = useState(false);
  const query = useQuery();
  const numero = query.get('numero');
  console.log('sourceOperator', sourceOperator);

  /**
 * Handles the submission of the payment form.
 *
 * Sets the loading state to true, prevents the default form submission behavior,
 * and sends a POST request to the payment processing API with the provided payment details.
 *
 * If the response from the API is successful, it redirects the user to the payment URL.
 * If the response fails, it displays an error message and sets the loading state to false.
 *
 * @param {Event} e - The form submission event.
 * @return {void}
 */
  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault();
    // Logique pour traiter le paiement ici
    await axios.post("https://djonanko-service.onrender.com/paiement/process-payout", {
      "currency": "XOF",
      "amount": parseInt(amount),
      "state": 'initiated',
      "return_url": 'https://djonanko.ci',
      "cancel_url": 'https://djonanko.ci',
      "reference": "Spark_Group",
      "operator": 'orange',
      "country": 'ci',
      "senderOperateur": sourceOperator,
      "receiverOperateur": recipientOperator,
      "receiverNumber": receiverNumber,
      "user_msisdn": recipientNumber,
      "payFees": true,
      "channel": "web"
    }, {
      headers: {
        'authenticationtoken': adminToken
      }
    }).then((response) => {
      if (response.data.status === 300) {
        setLoading(false)
        setMessage("Une erreur est survenue, veuillez reessayer !")
      } else if (response.data.status === 201) {
        console.log('response', response.data);
        const payment_url = response.data.payment_url;
        window.location.href = payment_url
        setLoading(false)
      } else {
        setLoading(false)
      }
    }).catch((error) => {
      console.log('erreur response', error);
      setLoading(false)
    })
  };


  /**
   * Logs in a user with the provided numero and password.
   *
   * @param {string} numero - The user's phone number.
   * @param {string} password - The user's password.
   * @return {object} The response data from the login API call.
   */
  const login = async (numero, password) => {
    console.log('numero', numero)
    console.log('password', password)
    if (numero === "" || password === "") {
      console.log("Veuillez remplir tous les champs")
    } else {
      await axios
        .post("https://djonanko-service.onrender.com/user/login", {
          numero,
          password
        })
        .then((res) => {
          console.log('res', res.data.access_token)
          setAdminToken(res.data.access_token)
          getUserInfos(res.data.access_token)
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

  /**
 * Displays the recipient operator number based on the provided operator.
 *
 * @param {string} operator - The operator for which to display the recipient number.
 * @return {JSX.Element} A JSX element containing the formatted recipient operator number.
 */
  const displayRecipientOperatorNumber = (operator) => {
    switch (operator) {
      case 'Orange':
        return <p className='text-sm'>{receiverInfos.orangeMoney === null ? `Le numero ${recipientOperator} money n'a pas été configuré` : <p>Numéro orange money: <span className='font-bold'>+225{receiverInfos.orangeMoney}</span></p>}</p>
      case 'Moov':
        return <p className='text-sm'>{receiverInfos.moovMoney === null ? `Le numero ${recipientOperator} money n'a pas été configuré` : <p>Numéro moov money: <span className='font-bold'>+225{receiverInfos.moovMoney}</span></p>}</p>
      case 'Wave':
        return <p className='text-sm'>{receiverInfos.waveMoney === null ? `Le numero ${recipientOperator} money n'a pas été configuré` : <p>Numéro wave: <span className='font-bold'>+225{receiverInfos.waveMoney}</span></p>}</p>
      case 'MTN':
        return <p className='text-sm'>{receiverInfos.mtnMoney === null ? `Le numero ${recipientOperator} money n'a pas été configuré` : <p>Numéro mtn money: <span className='font-bold'>+225${receiverInfos.mtnMoney}</span></p>}</p>
      default:
        return <p></p>
    }
  }

  // const displayOTPInput = (sourceOperator) => {
  //   if (sourceOperator === 'Orange' || sourceOperator === 'Moov' || sourceOperator === 'MTN') {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  /**
   * Retrieves user information by phone number using the provided authentication token.
   *
   * @param {string} token - The authentication token for the request.
   * @return {Promise<void>} A promise that resolves when the user information is retrieved.
   */
  const getUserInfos = async (token) => {
    await axios.get(`https://djonanko-service.onrender.com/user/user-infos-by-number`, {
      headers: {
        'authenticationtoken': token
      },
      params: {
        phoneNumber: numero
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
    if (adminToken === '' || sourceOperator === '' || recipientNumber === '' || recipientNumber.length < 10 || amount === '' || parseInt(amount) < 500) {
      return true
    } else {
      return false
    }
  }

  useEffect(() => {
    setReceiverNumber(numero);
    login('0709483463', '1234');
  }, []);

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
              <p className='italic mb-2'>Informations du destinataire</p>
              <p className='text-sm'>Noms et prenoms: <span className='font-bold'>{receiverInfos.fullname}</span></p>
              {recipientOperator === '' ? (
                <p></p>
              ) : (
                displayRecipientOperatorNumber(recipientOperator)
              )}
            </>
          )}
        </div>
        <div className="max-w-md mx-auto p-4">
          <form className='flex flex-col' onSubmit={handleSubmit}>
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

            <div className="mb-1">
              <label className="block text-gray-700 mb-0">Montant</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            {parseInt(amount) < 500 && <p className='text-red-500 mb-4'>Entrez un montant supérieur ou égale à 500 FCFA</p>}

            {/* {displayOTPInput(sourceOperator) && <div className="mb-4">
              <label className="block text-gray-700 mb-2">Saisissez le code OTP</label>
              <input
                type="text"
                max={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>} */}
            {loading ? (
              <div style={{ justifyContent: 'center', alignItems: 'center', display:'flex' }}>
                <InfinitySpin
                  visible={true}
                  width="100"
                  color="#0b4530"
                  ariaLabel="infinity-spin-loading"
                />
              </div>
            ) : (
              <button
                type="submit"
                className="w-1/2 text-white py-2 rounded-lg transition self-center duration-300 button"
                disabled={disabledButton()}
                style={{ backgroundColor: disabledButton() ? '#efefef' : '#0b4530', color: disabledButton() ? '#000' : '#fff' }}
              >
                Effectuer le paiement
              </button>
            )}
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

export default Payment;
