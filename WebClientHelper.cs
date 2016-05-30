// <copyright file="WebClientHelper.cs" company="API">
//     Copyright (c) API. All rights reserved.
// </copyright>
// <summary>This is WebClientHelper class. Client for fetching data from service.</summary>

namespace AOHP.Core
{
    using System;
    using System.Net;
    using System.Net.Http;
    using System.Text;
    using System.Threading.Tasks;
    using System.Xml.Serialization;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;

    /// <summary>
    /// Static helper class for web resource access.
    /// </summary>
    public static class WebClientHelper
    {
        /// <summary>
        /// Get response in XML format.
        /// </summary>
        /// <param name="url">Url string.</param>
        /// <param name="obj">Object passed for deserialization.</param>
        /// <returns>Returns object.</returns>
        public static object GetMaterialXMLData(string url, object obj)
        {
            try
            {
                HttpClient httpClient = new HttpClient();
                var xmlData = httpClient.GetStringAsync(url).Result;
                var result = CreateObject(xmlData.ToString(), obj);
                return result;
            }
            catch (Exception)
            {
                return null;
            }
        }

        /// <summary>
        /// Deserialize XML string.
        /// </summary>
        /// <param name="xmlString">XML String.</param>
        /// <param name="classObject">Object passed for deserialization.</param>
        /// <returns>Returns object.</returns>
        public static object CreateObject(string xmlString, object classObject)
        {
            XmlSerializer xmlSerializer = new XmlSerializer(classObject.GetType());
            System.IO.StringReader stringReader = new System.IO.StringReader(xmlString);
            return xmlSerializer.Deserialize(stringReader);
        }

        /// <summary>
        /// Get response in JSON format.
        /// </summary>
        /// <typeparam name="T">Object type.</typeparam>
        /// <param name="url">Url string.</param>
        /// <returns>Returns object.</returns>
        public static async Task<object> GetResponseDataAsync<T>(string url)
        {
            try
            {
                HttpClient httpClient = new HttpClient();
                var data = await httpClient.GetStringAsync(url).ConfigureAwait(false);
                return JsonConvert.DeserializeObject<T>(data);
            }
            catch (AggregateException)
            {
                return null;
            }
            catch (HttpRequestException)
            {
                return null;
            }
            catch (Exception ex)
            {
                return ex;
            }
        }

        public static async Task<T> PostDataAsync<T>(string uri, object data, bool requireJsonEncode = true)
        {
            var httpClient = new HttpClient();
            var httpContent = (StringContent)null;
            if (requireJsonEncode)
            {
                var jsonData = await Task.Run(() => JsonConvert.SerializeObject(data)).ConfigureAwait(false);
                httpContent = new StringContent(jsonData, Encoding.UTF8, "application/json");
            }
            else
            {
                httpContent = new StringContent(data.ToString(), Encoding.ASCII, "plain/text");
            }

            var response = await httpClient.PostAsync(uri, httpContent).ConfigureAwait(false);
            var responseContent = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
            return JsonConvert.DeserializeObject<T>(responseContent, new JsonDateTimeConverter());
        }

        /// <summary>
        /// Get response in JSON format.
        /// </summary>
        /// <typeparam name="T">Object type.</typeparam>
        /// <param name="url">Url string.</param>
        /// <returns>Returns object.</returns>
        public static object GetResponseData<T>(string url)
        {
            try
            {
                HttpClient httpClient = new HttpClient();
                
                var data = httpClient.GetStringAsync(url).Result;
                if (data == null || Convert.ToString(data) == "[]")
                {
                    return null;
                }
                {
                    return JsonConvert.DeserializeObject<T>(data);
                }
            }
            catch (AggregateException)
            {
                return null;
            }
            catch (HttpRequestException)
            {
                return null;
            }
            catch (Exception ex)
            {
                return ex;
            }
        }


    }
}
