// <copyright file="FTPClient.cs" company="AOHP">
//     Copyright (c) AOHP. All rights reserved.
// </copyright>
// <summary>FTPClient is used to save resource to FTP location.</summary>
namespace AOHP.Core
{
    using System;
    using System.IO;
    using System.Net;

    /// <summary>
    /// FTP client for uploading file to ftp.
    /// </summary>
    public class FTPClient
    {
        /// <summary>
        /// Local field for ftp <c>ipaddress</c>.
        /// </summary>
        private string localIpAddress;

        /// <summary>
        /// Local field for ftp user name.
        /// </summary>
        private string username;

        /// <summary>
        /// Local field for ftp password.
        /// </summary>
        private string password;

        /// <summary>
        /// Initializes a new instance of the FTPClient class.
        /// </summary>
        public FTPClient()
        {
        }

        /// <summary>
        /// Initializes a new instance of the FTPClient class.
        /// </summary>
        /// <param name="localIpAddress">FTP server address.</param>
        /// <param name="username">FTP server user name.</param>
        /// <param name="password">FTP server password.</param>
        public FTPClient(string localIpAddress, string username, string password)
        {
            this.localIpAddress = localIpAddress;
            this.username = username;
            this.password = password;
        }

        /// <summary>
        /// Uploads file to the FTP server.
        /// </summary>
        /// <param name="filePath">The file path of the resource.</param>
        public void UploadFile(string filePath)
        {
            var fileUri = new Uri(string.Format(@"ftp://{0}/{1}", this.localIpAddress, Path.GetFileName(filePath)));
            using (WebClient client = new WebClient())
            {
                client.Credentials = new NetworkCredential(this.username, this.password);
                var responseBytes = client.UploadFile(fileUri, filePath);
                string s = client.Encoding.GetString(responseBytes);
            }
        }
    }
}
