"use client"
import React from 'react'
import * as z from "zod"
import { Button } from '@/components/ui/button'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FaFacebook, FaGithub, FaGoogle } from "react-icons/fa6";
import Link from "next/link"


const signUpSchema = z.object({
  name: z.string()
    .min(2, "Name should have at least 2 characters.")
    .max(50, "Name should not exceed 50 characters.")
    .refine((value) => /^[a-zA-Z]+[-'s]?[a-zA-Z ]+$/.test(value), "Name should contain only alphabets and spaces."),

    email: z.string().email("Email must be valid."),

    password: z.string().min(6, "Password should have at least 6 characters."),

    confirmPassword: z.string().min(6, "Password should have at least 6 characters."),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export default function Home() {
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  function onSubmit(values: z.infer<typeof signUpSchema>) {
    console.log(values)
}
 
  return (
    <>
      <div className='signUpWrapper'>
      <div className='formWrapper'>
       <div className='left'>
        <h3 className='title'>Welcome Back!</h3>
        <p>To keep connected with us please login with your personal info</p>
        <Link href={"/signin"}>
        <Button className='border-slate-500 text-slate-300
         hover:border-slate-200 hover:text-slate-100
         transition-colors border rounded-full px-8'>
          Sign In
        </Button>
        </Link>
       </div>
       <div className='right'>
     <h3 className='text-center text-2xl font-semibold'>
      Register Here
     </h3>
     <div className='socialSignUpOptions flex gap-2'>
       <Button variant={"outline"} className='socialFormBtn'>
        <FaGoogle className='h-5 w-5' />
       </Button>
       <Button variant={"outline"} className='socialFormBtn'>
        <FaFacebook className='h-5 w-5' />
       </Button>
       <Button variant={"outline"} className='socialFormBtn'>
        <FaGithub className='h-5 w-5' />
       </Button>
     </div>
     <p className='text-center'>or use this option</p>
     <Form {... form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
       <FormField 
       control={form.control}
       name='name'
       render={({ field }) => (
        <FormItem className='space-y-0 mb-2'>
         <FormLabel>
          Name
          </FormLabel>
        <FormControl>
          <Input placeholder='Judiann Akwaowo'
          { ... field} />
        </FormControl>
        <FormMessage />
        </FormItem>
       )}
       />

       <FormField 
       control={form.control}
       name='email'
       render={({ field }) => (
        <FormItem className='space-y-0 mb-2'>
         <FormLabel>
          Email
          </FormLabel>
        <FormControl>
          <Input placeholder='judiann@example.com'
          { ... field} />
        </FormControl>
        <FormMessage />
        </FormItem>
       )}
       />

       <FormField 
       control={form.control}
       name='password'
       render={({ field }) => (
        <FormItem className='space-y-0 mb-2'>
         <FormLabel>
          Password
          </FormLabel>
        <FormControl>
          <Input placeholder='********'
        type='password'  { ... field} />
        </FormControl>
        <FormMessage />
        </FormItem>
       )}
       />

       <FormField 
       control={form.control}
       name='confirmPassword'
       render={({ field }) => (
        <FormItem className='space-y-0 mb-2'>
         <FormLabel>
          Confirm Password
          </FormLabel>
        <FormControl>
          <Input placeholder='********'
        type='password'  { ... field} />
        </FormControl>
        <FormMessage />
        </FormItem>
       )}
       />

       <Button type='submit' className='w-full'>
        Submit
       </Button>
      </form>
     </Form>
       </div>
      </div>
    </div>
    </>
  );
}
