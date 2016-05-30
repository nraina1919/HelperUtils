// <copyright file="Helper.cs" company="API">
//     Copyright (c) API. All rights reserved.
// </copyright>
// <summary>Helper utility class for provided application level helper methods.</summary>

namespace AOHP.Core
{
    using System;
    using System.Collections.Generic;
    using System.Data;
    using System.Data.OleDb;
    using System.IO;
    using System.Text;
    using System.Text.RegularExpressions;
    using System.Web;
    using System.Web.Configuration;
    using System.Web.Security;
    using HtmlAgilityPack;
    using iTextSharp.text;
    using iTextSharp.text.pdf;

    /// <summary>
    /// Utility class.
    /// </summary>
    public static class Helper
    {
        /// <summary>
        /// Provides feed items separator.
        /// </summary>
        public const string FEED_FILE_DATA_SEPARATOR = "||";

        /// <summary>
        /// Maximum single part item quantity that can be added to the cart.
        /// </summary>
        public const int CART_MAX_PART_QUANTITY = 5;

        /// <summary>
        /// Script placeholder ##SCRIPT##.
        /// </summary>
        public const string CUSTOM_TEMPLATE_SCRIPT_PLACEHOLDER = "##SCRIPT##";

        /// <summary>
        /// File cookie name.
        /// </summary>
        public const string CUSTOM_FILECOOKIE_NAME = "_fileDone";

        /// <summary>
        /// Locksmith session key.
        /// <para>Used on Customer Controller for saving Locksmith User session during redirects.</para>
        /// </summary>
        public const string LOCKSMITH_SESSION_KEY = "89857d0727f34f9e9a468c52b78f808b";

        /// <summary>
        /// User session key.
        /// <para>Used on <c>UserSessionControlPanel</c> class.</para>
        /// </summary>
        public const string USER_SESSION_KEY = "dbd2395c523f4cfab6425fe50b8b7f54";

        /// <summary>
        /// Guest User Cookie.
        /// </summary>
        public const string GUEST_USER_COOKIE_KEY = "ba27dfcc3a97453fa171a6a4f0b2b525";

        /// <summary>
        /// Gets the Payment Gateway Logo Url.
        /// </summary>
        public static string PaymentGatewayLogoUrl
        {
            get
            {
                return WebConfigurationManager.AppSettings["Payment:Gateway:LogoUrl"];
            }
        }

        /// <summary>
        /// Gets the Payment Gateway LoginID.
        /// </summary>
        public static string PaymentGatewayLoginID
        {
            get
            {
                return WebConfigurationManager.AppSettings["Payment:Gateway:LoginID"];
            }
        }

        /// <summary>
        /// Gets the Payment Gateway Transaction Key.
        /// </summary>
        public static string PaymentGatewayTransactionKey
        {
            get
            {
                return WebConfigurationManager.AppSettings["Payment:Gateway:TransactionKey"];
            }
        }

        /// <summary>
        /// Gets the Payment Gateway Form Post Url.
        /// </summary>
        public static string PaymentGatewayFormPostUrl
        {
            get
            {
                return WebConfigurationManager.AppSettings["Payment:Gateway:FormPostUrl"];
            }
        }
        
        /// <summary>
        /// Gets the unit down order charges percentage.
        /// </summary>
        public static decimal OrderUnitDownOrderPercent
        {
            get
            {
                return Convert.ToDecimal(WebConfigurationManager.AppSettings["Order:UnitDownOrderPercent"]);
            }
        }

        /// <summary>
        /// Gets the order shipping charges percentage.
        /// </summary>
        public static decimal OrderShippingChargePercent
        {
            get
            {
                return Convert.ToDecimal(WebConfigurationManager.AppSettings["Order:ShippingChargePercent"]);
            }
        }

        /// <summary>
        /// Gets the confirmation for saving feed on local path.
        /// </summary>
        public static bool IsFeedDiskSaveRequire
        {
            get
            {
                return Convert.ToInt32(WebConfigurationManager.AppSettings["IsFeedDiskSaveRequire"]) == 1;
            }
        }

        /// <summary>
        /// Gets user feed file path.
        /// </summary>
        public static string GetUserFeedFilePath
        {
            get
            {
                return WebConfigurationManager.AppSettings["GetUserFeedFilePath"];
            }
        }

        /// <summary>
        /// Gets order feed file path.
        /// </summary>
        public static string GetOrderFeedFilePath
        {
            get
            {
                return WebConfigurationManager.AppSettings["GetOrderFeedFilePath"];
            }
        }

        /// <summary>
        /// Gets guest cookie epxiration in years.
        /// </summary>
        public static int GuestCookieExpirationYears
        {
            get
            {
                return Convert.ToInt32(WebConfigurationManager.AppSettings["GuestCookieExpirationYears"]);
            }
        }

        /// <summary>
        /// Gets Date time format string as <c>dd-MMM-yyyy</c>.
        /// </summary>
        /// <value>Date time string.</value>
        public static string DateTimeFormat1
        {
            get
            {
                return WebConfigurationManager.AppSettings["DateTimeFormat1"] ?? "dd-MMM-yyyy";
            }
        }

        /// <summary>
        /// Gets Date time format string as <c>dd MMM yyyy</c>.
        /// </summary>
        /// <value>Date time string.</value>
        public static string DateTimeFormat2
        {
            get
            {
                return WebConfigurationManager.AppSettings["DateTimeFormat2"] ?? "dd MMM yyyy";
            }
        }

        /// <summary>
        /// Gets Date time format string as <c>dd_MM_yy</c>.
        /// usages - Order Summary Export.
        /// </summary>
        /// <value>Date time string.</value>
        public static string DateTimeFormat3
        {
            get
            {
                return WebConfigurationManager.AppSettings["DateTimeFormat3"] ?? "dd_MM_yy";
            }
        }

        /// <summary>
        /// Gets Date time format string as <c>MM/dd/yyyy</c>.
        /// </summary>
        /// <value>Date time string.</value>
        public static string DateTimeFormat4
        {
            get
            {
                return WebConfigurationManager.AppSettings["DateTimeFormat4"] ?? "MM/dd/yyyy";
            }
        }

        /// <summary>
        /// Gets Date time format string as <c>MMMM dd,yyyy</c>.
        /// usages - Order Summary template.
        /// </summary>
        /// <value>Date time string.</value>
        public static string DateTimeFormat5
        {
            get
            {
                return WebConfigurationManager.AppSettings["DateTimeFormat5"] ?? "MMMM dd,yyyy";
            }
        }

        /// <summary>
        /// Gets Date time format string as <c>dd/MM/yyyy</c>.
        /// </summary>
        /// <value>Date time string.</value>
        public static string DateTimeFormat6
        {
            get
            {
                return WebConfigurationManager.AppSettings["DateTimeFormat6"] ?? "dd/MM/yyyy";
            }
        }

        /// <summary>
        /// Gets Date time format string as <c>MMMM d, yyyy</c>.
        /// </summary>
        /// <value>Date time string.</value>
        public static string DateTimeFormat7
        {
            get
            {
                return WebConfigurationManager.AppSettings["DateTimeFormat7"] ?? "MMMM d, yyyy";
            }
        }

        /// <summary>
        /// Gets time format string as 24 Hour <c>HH:mm</c>.
        /// </summary>
        /// <value>Time string.</value>
        public static string DateTimeFormat8
        {
            get
            {
                return WebConfigurationManager.AppSettings["DateTimeFormat8"] ?? "HH:MM";
            }
        }

        /// <summary>
        /// Gets Directory path for custom template views.
        /// </summary>
        /// <value>Custom view template.</value>
        public static string CustomViewTemplatePath
        {
            get
            {
                return WebConfigurationManager.AppSettings["CustomViewTemplatePath"];
            }
        }

        /// <summary>
        /// Gets Order Summary <c>CSV</c> Columns.
        /// </summary>
        /// <value>Array of string of <c>CSV</c> Columns.</value>
        public static string[] OrderSummaryCSVColumns
        {
            get
            {
                return WebConfigurationManager.AppSettings["OrderSummary:CSVColumns"] == null ? new string[] { } : WebConfigurationManager.AppSettings["OrderSummary:CSVColumns"].Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
            }
        }

        /// <summary>
        /// Gets <c>Webstore</c> User Session Timeout.
        /// </summary>
        /// <value>Returns timeout in integer.</value>
        public static int WebstoreUserSessionTimeout
        {
            get
            {
                return WebConfigurationManager.AppSettings["Webstore:UserSessionTimeout"] == null ? 30 : Convert.ToInt32(WebConfigurationManager.AppSettings["Webstore:UserSessionTimeout"]);
            }
        }

        /// <summary>
        /// Gets <c>Cms</c> Xml Generator - Xml Full Path.
        /// <para>Use <c>Server.MapPath</c> when using this property.</para>
        /// </summary>
        /// <value>Returns full path.</value>
        public static string CmsUrlXmlFileFullPath
        {
            get
            {
                return WebConfigurationManager.AppSettings["CmsUrlXml:FileFullPath"];
            }
        }

        /// <summary>
        /// Gets <c>Cms</c> Xml Generator - Invalid file extensions.
        /// </summary>
        /// <value>Returns comma-separated file extensions.</value>
        public static string CmsUrlXmlExcludedExt
        {
            get
            {
                return WebConfigurationManager.AppSettings["CmsUrlXml:ExcludedExt"];
            }
        }

        /// <summary>
        /// Gets the order service configuration endpoint name.
        /// </summary>
        /// <value>Returns config name.</value>
        public static string OrderServiceEndpointConfigName
        {
            get
            {
                return WebConfigurationManager.AppSettings["OrderServiceEndpointConfigName"];
            }
        }

        /// <summary>
        /// Generate PDF from Html, returns byteArray.
        /// </summary>
        /// <param name="html">Html string.</param>
        /// <returns>Byte array.</returns>
        public static byte[] GetPdfStreamFromHtml(string html)
        {
            byte[] bytes;
            var doc = (Document)null;
            var writer = (PdfWriter)null;
            using (var ms = new MemoryStream())
            {
                try
                {
                    doc = new Document();
                    writer = PdfWriter.GetInstance(doc, ms);
                    writer.PageEvent = new PageEventHelper();
                    doc.Open();

                    var example_html = html;

                    using (var docHtml = new StringReader(example_html))
                    {
                        iTextSharp.tool.xml.XMLWorkerHelper.GetInstance().ParseXHtml(writer, doc, docHtml);
                    }
                }
                finally
                {
                    if (doc != null)
                    {
                        doc.Dispose();
                    }

                    if (writer != null)
                    {
                        writer.Dispose();
                    }
                }

                return bytes = ms.ToArray();
            }
        }

        /// <summary>
        /// Split Pascal Case string.
        /// </summary>
        /// <param name="datum">Data string.</param>
        /// <returns>String object.</returns>
        public static string SplitPascalCase(string datum)
        {
            return Regex.Replace(datum ?? string.Empty, "(\\B[A-Z])", " $1");
        }

        /// <summary>
        /// Get data from excel.
        /// </summary>
        /// <param name="filePath">Excel file path.</param>
        /// <returns>Returns <c>Datatable</c>.</returns>
        public static DataTable GetDataFromExcel(string filePath)
        {
            DataTable dataTable = new DataTable();
            string connString = string.Empty;
            OleDbConnection conn = new OleDbConnection();
            try
            {
                if (Path.GetExtension(filePath).ToLower().Equals(".xls") || Path.GetExtension(filePath).ToLower().Equals(".xlsx"))
                {
                    connString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + filePath + ";Extended Properties=\"Excel 12.0 Macro;HDR=YES;\"";
                }
                else
                {
                    connString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + filePath + ";Extended Properties=\"Excel 12.0;HDR=YES;\"";
                }

                string query = "SELECT * FROM [sheet1$]"; // You can use any different queries to get the data from the excel sheet
                StringBuilder filterKey = new StringBuilder();
                conn = new OleDbConnection(connString);

                if (conn.State == ConnectionState.Closed)
                {
                    conn.Open();
                }

                using (OleDbDataAdapter oledbDataAdp = new OleDbDataAdapter(query, conn))
                {
                    oledbDataAdp.Fill(dataTable);
                    foreach (DataColumn dc in dataTable.Columns)
                    {
                        if (dc.ColumnName.Trim().ToLower() != "Part Number".ToLower())
                        {
                            throw new Exception("Excel Format Is Invalid Please Download Template From ");
                        }

                        break;
                    }

                    for (int i = 0; i <= dataTable.Rows.Count - 1; i++)
                    {
                        // Check if first column is empty
                        // If empty then delete such record
                        if (dataTable.Rows[i][0].ToString() == string.Empty)
                        {
                            dataTable.Rows[i].Delete();
                        }
                    }

                    dataTable.AcceptChanges();
                }
            }
            finally
            {
                conn.Close();
                File.Delete(filePath);
            }

            return dataTable;
        }

        /// <summary>
        /// Remove duplicate word from string .
        /// </summary>
        /// <param name="wordString">Word string.</param>
        /// <returns>String object.</returns>
        public static string RemoveDuplicateWords(string wordString)
        {
            // 1
            // Keep track of words found in this Dictionary.
            var wordSet = new Dictionary<string, bool>();

            // 2
            // Build up string into this StringBuilder.
            StringBuilder stringSet = new StringBuilder();

            // 3
            // Split the input and handle spaces and punctuation.
            string[] datum = wordString.Split(new char[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries);

            // 4
            // Loop over each word
            foreach (string current in datum)
            {
                // 5
                // Lowercase each word
                string lower = current.ToLower();

                // 6
                // If we haven't already encountered the word,
                // append it to the result.
                if (!wordSet.ContainsKey(lower))
                {
                    stringSet.Append(current).Append(',');
                    wordSet.Add(lower, true);
                }
            }

            // 7
            // Return the duplicate words removed
            return stringSet.ToString().Trim();
        }

        /// <summary>
        /// Replace multiple white spaces with one white space.
        /// </summary>
        /// <param name="dirtyString">String for replace.</param>
        /// <returns>Replaced string.</returns>
        public static string ReplaceMultipleWhiteSpaces(string dirtyString)
        {
            string result = string.Empty;
            if (dirtyString != null)
            {
                result = System.Text.RegularExpressions.Regex.Replace(dirtyString, @"\s+", " ");
            }

            return result;
        }

        /// <summary>
        /// This method returns the plain text from html.
        /// </summary>
        /// <param name="html">Data html.</param>
        /// <returns>Returns text.</returns>
        public static string GetPlainTextFromHtml(string html)
        {
            string mainContent = html;
            var htmlDoc = new HtmlDocument();
            if (mainContent.IndexOf("<html>") < 0)
            {
                mainContent = "<html><body>" + mainContent + "</body></html>";
            }

            mainContent = Helper.HtmlStripScriptTag(mainContent);
            mainContent = Helper.HtmlStripStyleTag(mainContent);
            htmlDoc.LoadHtml(mainContent);
            return htmlDoc.DocumentNode.InnerText.ToLowerInvariant().Trim();
        }

        /// <summary>
        /// This method returns the script-stripped off html.
        /// </summary>
        /// <param name="html">Data html.</param>
        /// <returns>Returns text.</returns>
        public static string HtmlStripScriptTag(string html)
        {
            var mainContent = html;
            if (mainContent.ToLowerInvariant().IndexOf("<script>") >= 0 && mainContent.ToLowerInvariant().IndexOf("</script>") >= 0)
            {
                var part1 = mainContent.ToLowerInvariant().Substring(0, mainContent.ToLowerInvariant().IndexOf("<script>"));
                var part2 = mainContent.ToLowerInvariant().Substring(mainContent.ToLowerInvariant().IndexOf("</script>") + "</script>".Length);
                mainContent = part1 + part2;
            }

            if (mainContent.ToLowerInvariant().IndexOf("<script>") >= 0 && mainContent.ToLowerInvariant().IndexOf("</script>") >= 0)
            {
                mainContent = Helper.HtmlStripScriptTag(mainContent);
            }

            return mainContent;
        }

        /// <summary>
        /// This method returns the style-stripped off html.
        /// </summary>
        /// <param name="html">Data html.</param>
        /// <returns>Returns text.</returns>
        public static string HtmlStripStyleTag(string html)
        {
            var mainContent = html;
            if (mainContent.ToLowerInvariant().IndexOf("<style>") >= 0 && mainContent.ToLowerInvariant().IndexOf("</style>") >= 0)
            {
                var part1 = mainContent.ToLowerInvariant().Substring(0, mainContent.ToLowerInvariant().IndexOf("<style>"));
                var part2 = mainContent.ToLowerInvariant().Substring(mainContent.ToLowerInvariant().IndexOf("</style>") + "</style>".Length);
                mainContent = part1 + part2;
            }

            if (mainContent.ToLowerInvariant().IndexOf("<style>") >= 0 && mainContent.ToLowerInvariant().IndexOf("</style>") >= 0)
            {
                mainContent = Helper.HtmlStripStyleTag(mainContent);
            }

            return mainContent;
        }

        /// <summary>
        /// Protect data for any purpose.
        /// </summary>
        /// <param name="text">Plain text passed.</param>
        /// <param name="purpose">Purpose domain.</param>
        /// <returns>Returns encrypted string.</returns>
        public static string Protect(string text, string purpose)
        {
            if (string.IsNullOrEmpty(text))
                return null;

            byte[] stream = Encoding.UTF8.GetBytes(text);
            byte[] encodedValue = MachineKey.Protect(stream, purpose);
            return HttpServerUtility.UrlTokenEncode(encodedValue);
        }

        /// <summary>
        /// Unprotect data for the original purpose.
        /// </summary>
        /// <param name="text">Encrypted text passed.</param>
        /// <param name="purpose">Purpose domain.</param>
        /// <returns>Returns decrypted string.</returns>
        public static string Unprotect(string text, string purpose)
        {
            if (string.IsNullOrEmpty(text))
                return null;

            byte[] stream = HttpServerUtility.UrlTokenDecode(text);
            byte[] decodedValue = MachineKey.Unprotect(stream, purpose);
            return Encoding.UTF8.GetString(decodedValue);
        }

        /// <summary>
        /// Prepares feed file by appending timestamp and fileIdentifier (if any) to the path.
        /// </summary>
        /// <param name="path">File path.</param>
        /// <param name="fileIdentifier">Unique file identifier, can be null.</param>
        /// <returns>Returns new file path.</returns>
        public static string ToPrepareFeedFilePath(this string path, string fileIdentifier = null)
        {
            var fileInfo = new FileInfo(path);
            return string.Format("{0}\\{1}_{4}_{2}{3}", Path.GetDirectoryName(fileInfo.FullName), Path.GetFileNameWithoutExtension(fileInfo.FullName), DateTime.Now.ToString("ddMMyyyyHHmmss"), fileInfo.Extension, fileIdentifier ?? string.Empty);
        }

        public static string ISO8601DateFormat(DateTime date)
        {
            return string.Concat(Convert.ToDateTime(date).ToString("s"), "Z");
        }




    }
}
