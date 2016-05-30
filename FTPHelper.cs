
namespace AOHP.Core
{
    using System.Web.Configuration;

    public static class FTPHelper
    {
        /// <summary>
        /// Gets website-feed ftp server ip with path(any subdirectory).
        /// </summary>
        public static string GetFtpServerIpPathForWebsite
        {
            get
            {
                return WebConfigurationManager.AppSettings["AOHP:FTP:ServerIpPath:ForWebsite"];
            }
        }

        /// <summary>
        /// Gets website-feed username.
        /// </summary>
        public static string GetFtpUsernameForWebsite
        {
            get
            {
                return WebConfigurationManager.AppSettings["AOHP:FTP:Username:ForWebsite"];
            }
        }

        /// <summary>
        /// Gets website-feed password.
        /// </summary>
        public static string GetFtpPasswordForWebsite
        {
            get
            {
                return WebConfigurationManager.AppSettings["AOHP:FTP:Password:ForWebsite"];
            }
        }


        /// <summary>
        /// Gets JDE-feed ftp server ip with path(any subdirectory).
        /// </summary>
        public static string GetFtpServerIpPathForJDE
        {
            get
            {
                return WebConfigurationManager.AppSettings["AOHP:FTP:ServerIpPath:ForJDE"];
            }
        }

        /// <summary>
        /// Gets JDE-feed username.
        /// </summary>
        public static string GetFtpUsernameForJDE
        {
            get
            {
                return WebConfigurationManager.AppSettings["AOHP:FTP:Username:ForJDE"];
            }
        }

        /// <summary>
        /// Gets JDE-feed password.
        /// </summary>
        public static string GetFtpPasswordForJDE
        {
            get
            {
                return WebConfigurationManager.AppSettings["AOHP:FTP:Password:ForJDE"];
            }
        }
    }
}
