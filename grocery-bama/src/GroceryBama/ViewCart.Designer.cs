namespace GroceryBama
{
    partial class ViewCart
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.button_order_price = new System.Windows.Forms.Button();
            this.numericUpDown = new System.Windows.Forms.NumericUpDown();
            this.label3 = new System.Windows.Forms.Label();
            this.button_order_name = new System.Windows.Forms.Button();
            this.comboSelect = new System.Windows.Forms.ComboBox();
            this.label2 = new System.Windows.Forms.Label();
            this.button_checkout = new System.Windows.Forms.Button();
            this.button_back = new System.Windows.Forms.Button();
            this.button_next = new System.Windows.Forms.Button();
            this.button_previous = new System.Windows.Forms.Button();
            this.textAll = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.comboDelete = new System.Windows.Forms.ComboBox();
            this.label5 = new System.Windows.Forms.Label();
            this.button_delete = new System.Windows.Forms.Button();
            this.button_change_quantity = new System.Windows.Forms.Button();
            this.labelTotal = new System.Windows.Forms.Label();
            ((System.ComponentModel.ISupportInitialize)(this.numericUpDown)).BeginInit();
            this.SuspendLayout();
            // 
            // button_order_price
            // 
            this.button_order_price.Location = new System.Drawing.Point(869, 360);
            this.button_order_price.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_order_price.Name = "button_order_price";
            this.button_order_price.Size = new System.Drawing.Size(107, 49);
            this.button_order_price.TabIndex = 84;
            this.button_order_price.Text = "Order By Price";
            this.button_order_price.UseVisualStyleBackColor = true;
            this.button_order_price.Click += new System.EventHandler(this.button_order_price_Click);
            // 
            // numericUpDown
            // 
            this.numericUpDown.Location = new System.Drawing.Point(295, 392);
            this.numericUpDown.Name = "numericUpDown";
            this.numericUpDown.Size = new System.Drawing.Size(121, 22);
            this.numericUpDown.TabIndex = 83;
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(181, 394);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(108, 17);
            this.label3.TabIndex = 82;
            this.label3.Text = "Select Quantity:";
            // 
            // button_order_name
            // 
            this.button_order_name.Location = new System.Drawing.Point(17, 360);
            this.button_order_name.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_order_name.Name = "button_order_name";
            this.button_order_name.Size = new System.Drawing.Size(107, 49);
            this.button_order_name.TabIndex = 81;
            this.button_order_name.Text = "Order By Name";
            this.button_order_name.UseVisualStyleBackColor = true;
            this.button_order_name.Click += new System.EventHandler(this.button_order_name_Click);
            // 
            // comboSelect
            // 
            this.comboSelect.FormattingEnabled = true;
            this.comboSelect.Location = new System.Drawing.Point(295, 360);
            this.comboSelect.Name = "comboSelect";
            this.comboSelect.Size = new System.Drawing.Size(121, 24);
            this.comboSelect.TabIndex = 80;
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(181, 363);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(114, 17);
            this.label2.TabIndex = 79;
            this.label2.Text = "Change Quantity";
            // 
            // button_checkout
            // 
            this.button_checkout.Location = new System.Drawing.Point(869, 497);
            this.button_checkout.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_checkout.Name = "button_checkout";
            this.button_checkout.Size = new System.Drawing.Size(107, 49);
            this.button_checkout.TabIndex = 78;
            this.button_checkout.Text = "Checkout";
            this.button_checkout.UseVisualStyleBackColor = true;
            this.button_checkout.Click += new System.EventHandler(this.button_checkout_Click);
            // 
            // button_back
            // 
            this.button_back.Location = new System.Drawing.Point(17, 497);
            this.button_back.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_back.Name = "button_back";
            this.button_back.Size = new System.Drawing.Size(107, 49);
            this.button_back.TabIndex = 77;
            this.button_back.Text = "Back";
            this.button_back.UseVisualStyleBackColor = true;
            this.button_back.Click += new System.EventHandler(this.button_back_Click);
            // 
            // button_next
            // 
            this.button_next.Location = new System.Drawing.Point(511, 497);
            this.button_next.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_next.Name = "button_next";
            this.button_next.Size = new System.Drawing.Size(107, 49);
            this.button_next.TabIndex = 76;
            this.button_next.Text = "Next";
            this.button_next.UseVisualStyleBackColor = true;
            this.button_next.Click += new System.EventHandler(this.button_next_Click);
            // 
            // button_previous
            // 
            this.button_previous.Location = new System.Drawing.Point(364, 497);
            this.button_previous.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_previous.Name = "button_previous";
            this.button_previous.Size = new System.Drawing.Size(107, 49);
            this.button_previous.TabIndex = 75;
            this.button_previous.Text = "Previous";
            this.button_previous.UseVisualStyleBackColor = true;
            this.button_previous.Click += new System.EventHandler(this.button_previous_Click);
            // 
            // textAll
            // 
            this.textAll.Location = new System.Drawing.Point(17, 55);
            this.textAll.Multiline = true;
            this.textAll.Name = "textAll";
            this.textAll.ReadOnly = true;
            this.textAll.Size = new System.Drawing.Size(959, 288);
            this.textAll.TabIndex = 74;
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Font = new System.Drawing.Font("Microsoft Sans Serif", 16.2F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label1.Location = new System.Drawing.Point(424, 10);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(146, 32);
            this.label1.TabIndex = 73;
            this.label1.Text = "View Cart";
            // 
            // comboDelete
            // 
            this.comboDelete.FormattingEnabled = true;
            this.comboDelete.Location = new System.Drawing.Point(675, 357);
            this.comboDelete.Name = "comboDelete";
            this.comboDelete.Size = new System.Drawing.Size(121, 24);
            this.comboDelete.TabIndex = 86;
            // 
            // label5
            // 
            this.label5.AutoSize = true;
            this.label5.Location = new System.Drawing.Point(590, 360);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(79, 17);
            this.label5.TabIndex = 85;
            this.label5.Text = "Delete Item";
            // 
            // button_delete
            // 
            this.button_delete.Location = new System.Drawing.Point(593, 386);
            this.button_delete.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_delete.Name = "button_delete";
            this.button_delete.Size = new System.Drawing.Size(203, 28);
            this.button_delete.TabIndex = 87;
            this.button_delete.Text = "Delete";
            this.button_delete.UseVisualStyleBackColor = true;
            this.button_delete.Click += new System.EventHandler(this.button_delete_Click);
            // 
            // button_change_quantity
            // 
            this.button_change_quantity.Location = new System.Drawing.Point(184, 419);
            this.button_change_quantity.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_change_quantity.Name = "button_change_quantity";
            this.button_change_quantity.Size = new System.Drawing.Size(232, 28);
            this.button_change_quantity.TabIndex = 88;
            this.button_change_quantity.Text = "Change";
            this.button_change_quantity.UseVisualStyleBackColor = true;
            this.button_change_quantity.Click += new System.EventHandler(this.button_change_quantity_Click);
            // 
            // labelTotal
            // 
            this.labelTotal.AutoSize = true;
            this.labelTotal.Location = new System.Drawing.Point(866, 35);
            this.labelTotal.Name = "labelTotal";
            this.labelTotal.Size = new System.Drawing.Size(81, 17);
            this.labelTotal.TabIndex = 89;
            this.labelTotal.Text = "Total Items:";
            // 
            // ViewCart
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(993, 556);
            this.Controls.Add(this.labelTotal);
            this.Controls.Add(this.button_change_quantity);
            this.Controls.Add(this.button_delete);
            this.Controls.Add(this.comboDelete);
            this.Controls.Add(this.label5);
            this.Controls.Add(this.button_order_price);
            this.Controls.Add(this.numericUpDown);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.button_order_name);
            this.Controls.Add(this.comboSelect);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.button_checkout);
            this.Controls.Add(this.button_back);
            this.Controls.Add(this.button_next);
            this.Controls.Add(this.button_previous);
            this.Controls.Add(this.textAll);
            this.Controls.Add(this.label1);
            this.Name = "ViewCart";
            this.Text = "ViewCart";
            ((System.ComponentModel.ISupportInitialize)(this.numericUpDown)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button button_order_price;
        private System.Windows.Forms.NumericUpDown numericUpDown;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.Button button_order_name;
        private System.Windows.Forms.ComboBox comboSelect;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Button button_checkout;
        private System.Windows.Forms.Button button_back;
        private System.Windows.Forms.Button button_next;
        private System.Windows.Forms.Button button_previous;
        private System.Windows.Forms.TextBox textAll;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.ComboBox comboDelete;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.Button button_delete;
        private System.Windows.Forms.Button button_change_quantity;
        private System.Windows.Forms.Label labelTotal;
    }
}