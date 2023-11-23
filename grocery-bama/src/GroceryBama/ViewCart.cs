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
    public partial class ViewCart : Form
    {
        List<ITEM> items = new List<ITEM>();
        int counter = 0;
        int fiveReached = 0;
        int numValidItems = 0;
        bool is_descending = true;
        bool price_descending = true;
        int totalItems = 0;
        public ViewCart()
        {
            InitializeComponent();
            LoadAll();
            DisplayItems();
        }

        private void button_next_Click(object sender, EventArgs e)
        {
            if (counter == Globals.cart.Count())
            {
                FormRefresh();
                return;
            }
            if (counter < 5)
            {
                counter = 0;
            }
            DisplayItems();
        }

        private void button_previous_Click(object sender, EventArgs e)
        {
            if (counter < 5)
            {
                counter = 0;
            }
            else
            {
                counter = counter - counter % 5;
                counter -= 5;
            }
            DisplayItems();
        }

        private void button_back_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void button_order_name_Click(object sender, EventArgs e)
        {
            is_descending = !is_descending;
            if (!is_descending)
            {
                List<ITEM> SortedList = Globals.cart.OrderBy(o => o.item_name).ToList();
                Globals.cart = SortedList;
                FormRefresh();
            }
            else
            {
                List<ITEM> SortedList = Globals.cart.OrderByDescending(o => o.item_name).ToList();
                Globals.cart = SortedList;
                FormRefresh();
            }
        }

        private void button_delete_Click(object sender, EventArgs e)
        {
            foreach (var item in Globals.cart)
            {
                if (item.item_id.ToString() == comboDelete.Text.Split('-')[0].Trim())
                {
                    DialogResult dialog = new DialogResult();
                    dialog = MessageBox.Show("Are you sure you want to delete this item?", "Alert!", MessageBoxButtons.YesNo);
                    if (dialog == DialogResult.Yes)
                    {
                        Globals.cart.Remove(item);
                        MessageBox.Show("Item removed successfully.");
                    }
                    else
                    {
                        MessageBox.Show("Item not deleted.");
                    }
                    FormRefresh();
                    return;
                }
            }
        }
        private void button_order_price_Click(object sender, EventArgs e)
        {
            price_descending = !price_descending;
            if (!price_descending)
            {
                List<ITEM> SortedList = Globals.cart.OrderBy(o => o.listed_price).ToList();
                Globals.cart = SortedList;
                FormRefresh();
            }
            else
            {
                List<ITEM> SortedList = Globals.cart.OrderByDescending(o => o.listed_price).ToList();
                Globals.cart = SortedList;
                FormRefresh();
            }
        }

        private void button_checkout_Click(object sender, EventArgs e)
        {
            foreach(var item in Globals.cart)
            {
                foreach(var persistent_items in items)
                {
                    if(item.item_id == persistent_items.item_id && item.quantity > persistent_items.quantity)
                    {
                        MessageBox.Show("You have too many of the following items: ", item.item_name);
                        return;
                    }
                }
            }
            Checkout form = new Checkout();
            this.Close();
            form.ShowDialog();
        }
        private void LoadAll()
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            string queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[item] ORDER BY item_name";
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
                        ITEM addItem = new ITEM();
                        addItem.item_id = Int32.Parse(dr["item_id"].ToString());
                        addItem.item_name = dr["item_name"].ToString();
                        addItem.quantity = Int32.Parse(dr["quantity"].ToString());
                        addItem.wholesale_price = Double.Parse(dr["wholesale_price"].ToString());
                        addItem.listed_price = Double.Parse(dr["listed_price"].ToString());
                        addItem.food_group = dr["food_group"].ToString();
                        addItem.description = dr["description"].ToString();
                        addItem.exp_date = dr["exp_date"].ToString();
                        items.Add(addItem);
                    }
                }
            }
        }
        private void DisplayItems()
        {
            textAll.Text = "";
            fiveReached = 0;
            totalItems = 0;
            comboSelect.Items.Clear();
            comboDelete.Items.Clear();
            if (!(Globals.cart.Any()))
            {
                textAll.Text = "There is nothing in the cart.";
                return;
            }
            for (int i = counter; i < Globals.cart.Count; i++)
            {
                if (fiveReached == 5) break;
                textAll.AppendText(String.Format("Item Name: {0} | Description: {1} | Expiration Date: {2} | Price: {3} | Quantity Purchased: {4}",
                    Globals.cart[i].item_name, Globals.cart[i].description, Globals.cart[i].exp_date, Globals.cart[i].listed_price, Globals.cart[i].quantity));
                textAll.AppendText(Environment.NewLine);
                textAll.AppendText(Environment.NewLine);
                string comboAdd = "";
                comboAdd += Globals.cart[i].item_id;
                comboAdd += " - ";
                comboAdd += Globals.cart[i].item_name;
                comboSelect.Items.Add(comboAdd);
                comboDelete.Items.Add(comboAdd);
                fiveReached++;
                counter++;
            }
            foreach(var item in Globals.cart)
            {
                totalItems += item.quantity;
            }
            labelTotal.Text = "Total Items: " + totalItems.ToString();
        }

        private void button_change_quantity_Click(object sender, EventArgs e)
        {
            foreach(var item in Globals.cart)
            {
                if(item.item_id.ToString() == comboSelect.Text.Split('-')[0].Trim())
                {
                    foreach(var glob_items in items)
                    {
                        if(item.item_id == glob_items.item_id && numericUpDown.Value > glob_items.quantity)
                        {
                            MessageBox.Show("The quantity of items you are trying to buy exceeds the amount in stock.");
                            return;
                        }
                    }
                    if (numericUpDown.Value < 1)
                    {
                        DialogResult dialog = new DialogResult();
                        dialog = MessageBox.Show("Are you sure you want to delete this item?", "Alert!", MessageBoxButtons.YesNo);
                        if (dialog == DialogResult.Yes)
                        {
                            Globals.cart.Remove(item);
                            MessageBox.Show("Item removed successfully.");
                        }
                        else
                        {
                            MessageBox.Show("Item not deleted.");
                        }
                    }
                    else
                    {
                        item.quantity = Decimal.ToInt32(numericUpDown.Value);
                        MessageBox.Show("Changes saved.");
                    }
                    FormRefresh();
                    return;
                }
            }
        }
        private void FormRefresh()
        {
            if (counter % 5 == 0) counter -= 5;
            else
            {
                counter -= counter % 5;
            }
            DisplayItems();
        }
    }
}
