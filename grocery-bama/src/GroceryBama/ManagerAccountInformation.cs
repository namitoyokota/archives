using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Data.SqlClient;

namespace GroceryBama
{
    public partial class ManagerAccountInformation : Form
    {
        List<ADDRESS> addresses = new List<ADDRESS>();
        List<GROCERYSTORE> stores = new List<GROCERYSTORE>();
        public ManagerAccountInformation()
        {
            InitializeComponent();
            LoadAll();
            LoadText();
        }

        private void button7_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void button_update_Click(object sender, EventArgs e)
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string query = "UPDATE [User] SET username = @username, password = @password, user_type = 'manager', email = @email, first_name = @first_name, last_name = @last_name WHERE username = @old_username";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                    command.Parameters.Add("@old_username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                    command.Parameters.Add("@password", SqlDbType.VarChar).Value = Globals.Persistent_Current.password;
                    command.Parameters.Add("@email", SqlDbType.VarChar).Value = textEmail.Text;
                    command.Parameters.Add("@first_name", SqlDbType.VarChar).Value = textFirstName.Text;
                    command.Parameters.Add("@last_name", SqlDbType.VarChar).Value = textLastName.Text;
                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }
                query = "UPDATE [Manages] SET username = @username, store_address = @store_address WHERE username = @old_username";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                    command.Parameters.Add("@old_username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                    command.Parameters.Add("@store_address", SqlDbType.Int).Value = Int32.Parse(comboStore.Text.Split('-')[0].Trim());
                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }
                foreach (var item in stores)
                {
                    if(item.address_id == Int32.Parse(comboStore.Text.Split('-')[0].Trim()))
                    {
                        Globals.Persistent_Store = item;
                    }
                }
                foreach (var item in addresses)
                {
                    if(item.id == Globals.Persistent_Store.address_id)
                    {
                        Globals.Store_Address = item;
                    }
                }
                Globals.Persistent_Current.email = textEmail.Text;
                Globals.Persistent_Current.first_name = textFirstName.Text;
                Globals.Persistent_Current.last_name = textLastName.Text;
            }
            MessageBox.Show("Update successful.");
            this.Close();
        }

        private void button_delete_Click(object sender, EventArgs e)
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string query = "DELETE from [GROCERYBAMA1].[dbo].[USER] where username = @username;";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }
            }
            Globals.has_deleted = true;
            MessageBox.Show("Delete Successful.");
            this.Close();
        }
        private void LoadAll()
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            string queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[grocerystore] ORDER BY store_id";
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        GROCERYSTORE addStore = new GROCERYSTORE();
                        addStore.store_id = Int32.Parse(dr["store_id"].ToString());
                        addStore.store_name = dr["store_name"].ToString();
                        addStore.phone = dr["phone"].ToString();
                        addStore.address_id = Int32.Parse(dr["address_id"].ToString());
                        addStore.opening_time = dr["opening_time"].ToString();
                        addStore.closing_time = dr["closing_time"].ToString();
                        stores.Add(addStore);
                    }
                }
                queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[address]";

                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        ADDRESS addAddress = new ADDRESS();
                        addAddress.id = Int32.Parse(dr["id"].ToString());
                        addAddress.house_number = dr["house_number"].ToString();
                        addAddress.state = dr["state"].ToString();
                        addAddress.street = dr["street"].ToString();
                        addAddress.city = dr["city"].ToString();
                        addAddress.zip_code = dr["zip_code"].ToString();
                        addresses.Add(addAddress);
                    }
                }
            }
        }
        private void LoadText()
        {
            textUsername.Text = Globals.Persistent_Current.username;
            textLastName.Text = Globals.Persistent_Current.last_name;
            textEmail.Text = Globals.Persistent_Current.email;
            textFirstName.Text = Globals.Persistent_Current.first_name;
            textStoreAddress.Text = Globals.Store_Address.house_number + " " + Globals.Store_Address.street;
            comboStore.Text = Globals.Persistent_Store.address_id + " - " + Globals.Persistent_Store.store_name;
            foreach (var item in stores)
            {
                string addToCombo = "";
                addToCombo += item.address_id;
                addToCombo += " - ";
                addToCombo += item.store_name;
                comboStore.Items.Add(addToCombo);
            }
        }
    }
}
